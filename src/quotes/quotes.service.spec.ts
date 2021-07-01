import { INestApplication, Type } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuoteEntity } from "../quotes/quotes.entity";
import { TickerEntity } from "../tickers/tickers.entity";
import { Connection } from "typeorm";
import { NewQuoteInput } from "../quotes/dto/new-quote.input";
import { NewTickerInput } from "../tickers/dto/new-ticker.input";
import { QuotesService } from "./quotes.service";
import { FindQuoteInput } from "./dto/find-quote.input";
import { Quote } from "./models/quote.model";
import { FindTickerInput } from "src/tickers/dto/find-ticker.input";
import { Ticker } from "../tickers/models/ticker.model";

async function emptyDatabase(connection: Connection) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    const quotesToDelete = await queryRunner.manager.find(QuoteEntity);

    //delete quotes from database
    for (const quote of quotesToDelete) {
        await queryRunner.manager.delete(QuoteEntity, { name: quote.name, timestamp: quote.timestamp });
    }

    const tickersToDelete = await queryRunner.manager.find(TickerEntity);

    //delete tickers from database
    for (const ticker of tickersToDelete) {
        await queryRunner.manager.delete(TickerEntity, { name: ticker.name });
    }

    await queryRunner.release();
}

//imitate concurrent client trying to add something
//timeout is added to be sure that the transactions will overlap
async function insertWithDelay(connection: Connection, toInsert: NewQuoteInput, delayInMs: number) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    await queryRunner.manager.insert(QuoteEntity, toInsert);
    await new Promise(f => setTimeout(f, delayInMs));
    await queryRunner.commitTransaction();
    await queryRunner.release();
}

async function deleteWithDelay(connection: Connection, toDelete: FindQuoteInput, delayInMs: number) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    await queryRunner.manager.delete(QuoteEntity, toDelete);
    await new Promise(f => setTimeout(f, delayInMs));
    await queryRunner.commitTransaction();
    await queryRunner.release();
}

async function deleteTickerWithDelay(connection: Connection, toDelete: FindTickerInput, delayInMs: number) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    await queryRunner.manager.delete(TickerEntity, toDelete);
    await new Promise(f => setTimeout(f, delayInMs));
    await queryRunner.commitTransaction();
    await queryRunner.release();
}

async function editWithDelay(connection: Connection, toEdit: NewQuoteInput, delayInMs: number) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    await queryRunner.manager.update(QuoteEntity, { name: toEdit.name, timestamp: toEdit.timestamp }, toEdit);
    await new Promise(f => setTimeout(f, delayInMs));
    await queryRunner.commitTransaction();
    await queryRunner.release();
}



async function insertTestingData(connection: Connection) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    for (let x = 1; x <= 2; x++) {
        await queryRunner.manager.insert(TickerEntity, new NewTickerInput(x.toString(), x.toString(), x.toString()));
        await queryRunner.manager.insert(QuoteEntity, new NewQuoteInput(x.toString(), x, x));
    }
    await queryRunner.release();
}

describe('QuotesService', () => {
    let app: INestApplication;

    let connection: Connection;
    let quotesService: QuotesService

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    envFilePath: process.env.NODE_ENV == 'test' ? 'config/test.env' : 'config/.env',
                }),
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) => ({
                        type: 'postgres',
                        host: config.get('POSTGRES_HOST'),
                        port: config.get('POSTGRES_PORT'),
                        username: config.get('POSTGRES_USER'),
                        password: config.get('POSTGRES_PASSWORD'),
                        database: config.get('POSTGRES_DB'),
                        entities: [QuoteEntity, TickerEntity],
                        synchronize: true,
                    })
                }),
                TypeOrmModule.forFeature([QuoteEntity, TickerEntity])],
            providers: [QuotesService]
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        connection = moduleFixture.get<Connection>(Connection);
        quotesService = moduleFixture.get<QuotesService>(QuotesService);
    })

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await emptyDatabase(connection);
        await insertTestingData(connection);
    });

    it('should be defined', async () => {
        expect(connection).toBeDefined();
        expect(quotesService).toBeDefined();
    });

    //quote used across the tests
    const toInsert = new NewQuoteInput('1', 2, 1);
    const toEdit = new NewQuoteInput('1', 2, 100);
    const toGet = new FindQuoteInput('1', 2);

    describe('addQuote', () => {
        it('should return added quote', async () => {
            await expect(quotesService.addQuote(toInsert)).resolves.toEqual(toInsert);
            //check if such a quote is in db
            await expect(quotesService.getQuote({ name: toInsert.name, timestamp: toInsert.timestamp })).resolves.toEqual(toInsert);
        });

        //quote already exists
        it('should return an error', async () => {
            await expect(quotesService.addQuote(new NewQuoteInput('1', 1, 1))).rejects.toThrowError('The quote with the given name and timespamt already exists.');
        });

        //other client add the same quote
        it('should return an error', async () => {
            let res = insertWithDelay(connection, toInsert, 200);
            await expect(quotesService.addQuote(toInsert)).rejects.toThrowError('The quote with the given name and timespamt already exists.');
            await res;
        });

        //other client delete quote
        //we want to add the same quote
        it('should return an error', async () => {
            await quotesService.addQuote(toInsert);

            let res = deleteWithDelay(connection, { name: toInsert.name, timestamp: toInsert.timestamp }, 200);
            //DELETE was run before ADD
            //transaction is not commited yet so quote still exists
            await expect(quotesService.addQuote(toInsert)).rejects.toThrowError('The quote with the given name and timespamt already exists.');
            await res;
        });

        //ticker is deleted
        //we try to add quote to that ticker
        it('should return an error', async () => {
            //add some testing ticker
            await connection.createQueryRunner().manager.insert(TickerEntity, { name: 'name', fullName: 'fullName', description: 'description' });

            let res = deleteTickerWithDelay(connection, { name: 'name' }, 200);
            //DELETE is executed but transaction is not commited
            //INSERT query will wait until transaction is commited
            //then the new ticker will be inserted together with new quote
            await expect(quotesService.addQuote(new NewQuoteInput('name',1,1))).resolves.toEqual(new Quote('name',1,1));
            await res;

            //ticker and quote should be in DB
            await expect(quotesService.getQuote({name: 'name', timestamp: 1})).resolves.toEqual(new Quote('name',1,1));
            await expect(connection.createQueryRunner().manager.findOne(TickerEntity,{name: 'name'})).resolves.toEqual(new Ticker('name','unknown','unknown'));
        });

    });

    describe('getQuote', () => {
        it('should return one quote', async () => {
            await expect(quotesService.getQuote({ name: '1', timestamp: 1 })).resolves.toEqual(new Quote('1', 1, 1));
        });

        //trying to get nonexistent quote
        it('should return an error', async () => {
            await expect(quotesService.getQuote({ name: 'notInDB', timestamp: 1 })).rejects.toThrowError('Value not found');
        });

        //other client add quote
        //we want to get it
        it('should return an error', async () => {
            let res = insertWithDelay(connection, toInsert, 200);
            await expect(quotesService.getQuote(toGet)).rejects.toThrowError('Value not found');
            await res;

            //now when the transaction is commited we can get this quote
            await expect(quotesService.getQuote(toGet)).resolves.toEqual(toInsert);
        });

        //other client deletes quote
        //we want to get it
        it('should return one quote', async () => {
            const find = new FindQuoteInput('1', 1);
            let res = deleteWithDelay(connection, find, 200);
            await expect(quotesService.getQuote(find)).resolves.toEqual(new Quote('1', 1, 1));
            await res;

            //now the quote is deleted
            await expect(quotesService.getQuote(find)).rejects.toThrowError('Value not found');
        });

        //other client edit quote
        //we want to get it
        it('should return non-edited quote', async () => {
            await quotesService.addQuote(toInsert);

            let res = editWithDelay(connection, toEdit, 200);
            await expect(quotesService.getQuote(toGet)).resolves.toEqual(toInsert);
            await res;

            //now transaction with EDIT is commited
            await expect(quotesService.getQuote(toGet)).resolves.toEqual(toEdit);
        });
    });

    describe('getQuotes', () => {
        it('should return array of quotes', async () => {
            await expect(quotesService.getQuotes()).resolves.toEqual([new Quote('1', 1, 1), new Quote('2', 2, 2)]);
        });

        it('should return empty array', async () => {
            await emptyDatabase(connection);

            await expect(quotesService.getQuotes()).resolves.toEqual([]);
        });
    });

    describe('deleteQuote', () => {
        it('should return deleted quote', async () => {
            await expect(quotesService.deleteQuote({ name: '1', timestamp: 1 })).resolves.toEqual(new Quote('1', 1, 1));

            //check if quote is deleted from DB
            await expect(quotesService.getQuote({ name: '1', timestamp: 1 })).rejects.toThrowError('Value not found');
        });

        //such a ticker does not exist
        it('should return an error', async () => {
            await expect(quotesService.deleteQuote({ name: 'notInDB', timestamp: 1 })).rejects.toThrowError('Value not found');
        });

        //other client tries to delete the same ticker
        it('should return an error', async () => {
            let res = deleteWithDelay(connection, new FindQuoteInput('2', 2), 200);
            //other client deletes before out delete is executed
            await expect(quotesService.deleteQuote({ name: '2', timestamp: 2 })).rejects.toThrowError('Value not found');
            await res;

            //ticker should be deleted
            await expect(quotesService.getQuote({ name: '2', timestamp: 2 })).rejects.toThrowError('Value not found');
        });

        //other client adds ticker
        //we try to delete it
        it('should return an error', async () => {
            let res = insertWithDelay(connection, toInsert, 200);
            //INSERT query was already run, but the transaction is not commited yet
            await expect(quotesService.deleteQuote(toGet)).rejects.toThrowError('Value not found');
            await res;

            //ticker should be in DB
            await expect(quotesService.getQuote(toGet)).resolves.toEqual(toInsert);
        });

        //other client edit the quote
        //we try to delete it
        it('should return edited quote', async () => {
            await quotesService.addQuote(toInsert);

            let res = editWithDelay(connection, toEdit, 200);
            //EDIT query was run, be transaction is not commited
            //DELETE will wait until transaction is commited and continue to delete
            await expect(quotesService.deleteQuote(toGet)).resolves.toEqual(toEdit);

            //ticker should not be in dB
            await expect(quotesService.getQuote(toGet)).rejects.toThrowError('Value not found');
        });
    });

    describe('editQuote', () => {
        it('should return edited quote', async () => {
            await expect(quotesService.editQuote(new NewQuoteInput('1',1,1000))).resolves.toEqual(new Quote('1',1,1000));
        });

        //there is no such a quote
        it('should return an error', async () => {
            await expect(quotesService.editQuote(new NewQuoteInput('notInDB',1,1))).rejects.toThrowError('Value not found');
        });

        //other client adds quote
        //we try to edit it
        it('should return an error', async () => {
            let res = insertWithDelay(connection,toInsert,200);
            await expect(quotesService.editQuote(toEdit)).rejects.toThrowError('Value not found');
            await res;

            //now when the transaction is commited we can edit this quote
            await expect(quotesService.editQuote(toEdit)).resolves.toEqual(toEdit);
            await expect(quotesService.getQuote(toGet)).resolves.toEqual(toEdit);
        });

        //other client deletes quote
        //we try to edit it
        it('should return an error', async () => {
            let res = deleteWithDelay(connection, new FindQuoteInput('1',1), 200);
            //DELETE query is run and transaction wait 200 ms
            //EDIT query is run before transaction commits so it waits until transaction commits
            //when the transaction commits the EDIT query throws an error that there is a conflict with concurrent transaction
            //EDIT query is send again and finally there is no such a quote that we can edit
            await expect(quotesService.editQuote(new NewQuoteInput('1',1,10))).rejects.toThrowError('Value not found');
            await res;
        });

        //other client edit quote
        //we try to edit it also
        it('should return edited ticker by us', async () => {
            const edit = new NewQuoteInput('1',1,100);
            let res = editWithDelay(connection, new NewQuoteInput('1',1,10),200);
            await expect(quotesService.editQuote(edit)).resolves.toEqual(edit);
            await res;

            //the quote in database should be equal to edit
            await expect(quotesService.getQuote(new FindQuoteInput('1',1))).resolves.toEqual(edit);
        });
    });




});