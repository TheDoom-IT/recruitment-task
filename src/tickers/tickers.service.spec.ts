import { INestApplication } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuoteEntity } from "../quotes/quotes.entity";
import { TickerEntity } from "../tickers/tickers.entity";
import { Connection } from "typeorm";
import { NewTickerInput } from "../tickers/dto/new-ticker.input";
import { TickersService } from "./tickers.service";
import { FindTickerInput } from "./dto/find-ticker.input";
import { NewQuoteInput } from "../quotes/dto/new-quote.input";

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

async function insertTestingData(tickersService: TickersService) {
    for (let x = 1; x <= 2; x++){
        await tickersService.addTicker(new NewTickerInput(x.toString(),x.toString(),x.toString()));
    }
}

//imitate concurrent client trying to add something
//timeout is added to be sure that the transactions will overlap
async function insertWithDelay(connection: Connection, toInsert: NewTickerInput, delayInMs: number) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    await queryRunner.manager.insert(TickerEntity, toInsert);
    await new Promise(f => setTimeout(f, delayInMs));
    await queryRunner.commitTransaction();
    await queryRunner.release();
}

async function insertQuoteWithDelay(connection: Connection, toInsert: NewQuoteInput, delayInMs: number) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    await queryRunner.manager.insert(QuoteEntity, toInsert);
    await new Promise(f => setTimeout(f, delayInMs));
    await queryRunner.commitTransaction();
    await queryRunner.release();
}

async function deleteWithDelay(connection: Connection, toDelete: FindTickerInput, delayInMs: number) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    await queryRunner.manager.delete(TickerEntity, toDelete);
    await new Promise(f => setTimeout(f, delayInMs));
    await queryRunner.commitTransaction();
    await queryRunner.release();
}

async function editWithDelay(connection: Connection, toEdit: NewTickerInput, delayInMs: number) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    await queryRunner.manager.update(TickerEntity, {name: toEdit.name}, toEdit);
    await new Promise(f => setTimeout(f, delayInMs));
    await queryRunner.commitTransaction();
    await queryRunner.release();
}


describe('TickerService', () => {
    let app: INestApplication;

    let connection: Connection;
    let tickersService: TickersService;

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
            providers: [TickersService]
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        connection = moduleFixture.get<Connection>(Connection);
        tickersService = moduleFixture.get<TickersService>(TickersService);
    })

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await emptyDatabase(connection);
    });

    it('should be defined', async () => {
        expect(connection).toBeDefined();
        expect(tickersService).toBeDefined();
    });


    //NewtickerInput which will be used across all of the tests
    const toInsert = new NewTickerInput('1', '1', '1');
    const toEdit = new NewTickerInput('1','edited','edited');

    describe('addTicker', () => {
        it('should return added ticker', async () => {
            
            await expect(tickersService.addTicker(toInsert)).resolves.toEqual(toInsert);

            //check if ticker is in DB
            expect(await tickersService.getTicker({ name: toInsert.name })).toEqual(toInsert);
        });

        //trying to add ticker which is in DB
        it('should return an error', async () => {
            //insert ticker
            await tickersService.addTicker(toInsert);

            //inserting again
            await expect(tickersService.addTicker(toInsert)).rejects.toThrowError('The ticker with the given name already exists.');
        });

        //other client adds the same ticker in concurrent transaction
        it('should return an error', async () => {
            let res = insertWithDelay(connection, toInsert, 200);
            await expect(tickersService.addTicker(toInsert)).rejects.toThrowError('The ticker with the given name already exists.');
            await res;
        });

        //other client try to delete ticker
        //the transaction is not commited yet
        //so we can't add such a ticker
        it('should return an error', async () => {
            await tickersService.addTicker(toInsert);

            let res = deleteWithDelay(connection,{name: toInsert.name},200);
            await expect(tickersService.addTicker(toInsert)).rejects.toThrowError('The ticker with the given name already exists.');
            await res;
        });

    });

    describe('getTicker', () => {
        it('should return one ticker', async() => {
            //add some ticker
            await tickersService.addTicker(toInsert);

            //ticker should be in DB
            await expect(tickersService.getTicker({name: toInsert.name})).resolves.toEqual(toInsert);
        });

        //trying to get ticker which does not exist
        it('should return an error', async () => {
            await expect(tickersService.getTicker({name: 'notInDB'})).rejects.toThrowError('Value not found');
        });

        //other client delete ticker that we want to get
        it('should return one ticker', async () => {
            await tickersService.addTicker(toInsert);

            let res = deleteWithDelay(connection,{name: toInsert.name},200);
            //transaction is not commited yet, we can get a ticker
            await expect(tickersService.getTicker({name: toInsert.name})).resolves.toEqual(toInsert);
            await res;
            //transaction was commited, now we can't get a ticker
            await expect(tickersService.getTicker({name: toInsert.name})).rejects.toThrowError('Value not found');
        });

        //other client adds a ticker and the transaction is not committed yet
        it('should return an error', async () => {
            let res = insertWithDelay(connection,toInsert,200);
            await expect(tickersService.getTicker({name: toInsert.name})).rejects.toThrowError('Value not found');
            await res;

            //transaction is commited, now we can get a ticker
            await expect(tickersService.getTicker({name: toInsert.name})).resolves.toEqual(toInsert);
        });

        //other client edit a ticker that we want to get
        it('should return non-edited ticker', async () => {
            await tickersService.addTicker(toInsert);

            let toEdit = new NewTickerInput('1','edited','edited');
            let res = editWithDelay(connection,toEdit,200);
            await expect(tickersService.getTicker({name: toInsert.name})).resolves.toEqual(toInsert);
            await res;

            //transcation is commited, quote is edited
            await expect(tickersService.getTicker({name : toInsert.name})).resolves.toEqual(toEdit);
        });
    });

    describe('getTickers', () => {
        it('should return array of tickers', async () => {
            //add some data
            await insertTestingData(tickersService);

            await expect(tickersService.getTickers()).resolves.toEqual([new NewTickerInput('1','1','1'), new NewTickerInput('2','2','2')]);
        });

        it('should return empty array', async () => {
            await expect(tickersService.getTickers()).resolves.toEqual([]);
        });
        
    });

    describe('deleteTicker', () => {

        it('should return deleted ticker', async () => {
            //add testing ticker
            await tickersService.addTicker(toInsert);

            await expect(tickersService.deleteTicker({name: toInsert.name})).resolves.toEqual(toInsert);

            //check if ticker was deleted
            await expect(tickersService.getTicker({name: toInsert.name})).rejects.toThrowError('Value not found');
        });

        //trying to delete unexisting ticker
        it('should return an error', async () => {
            await expect(tickersService.deleteTicker({name: 'notInDB'})).rejects.toThrowError('Value not found');
        });

        //trying to delete ticker which is used by some quote
        it('should return an error', async () => {
            //add testing ticker and quote
            await tickersService.addTicker(toInsert);
            await insertQuoteWithDelay(connection,new NewQuoteInput('1',1,1),0);

            await expect(tickersService.deleteTicker({name: toInsert.name})).rejects.toThrowError('The ticker is already used by some quotes. Try to delete quotes at first.');

        });

        //other client adds ticker
        //we want to delete it
        it('should return an error', async () => {
            let res = insertWithDelay(connection, toInsert,200);
            //transaction did not end
            await expect(tickersService.deleteTicker({name: toInsert.name})).rejects.toThrowError('Value not found');
            await res;

            //transaction ended, now we can try to delete
            await expect(tickersService.deleteTicker({name: toInsert.name})).resolves.toEqual(toInsert);
        });

        //other client tries to delete the same ticker
        it('should return an error', async () => {
            //insert testing ticker
            await tickersService.addTicker(toInsert);

            let res = deleteWithDelay(connection, {name: toInsert.name},200);
            //second client deleted ticker first
            await expect(tickersService.deleteTicker({name: toInsert.name})).rejects.toThrowError('Value not found');
            await res;
        });

        //try to delete edited ticker
        it('should return deleted ticker', async () => {
            await tickersService.addTicker(toInsert);

            let res = editWithDelay(connection, toEdit, 200);
            await expect(tickersService.deleteTicker({name: toInsert.name})).resolves.toEqual(toEdit);
            await res;

            await expect(tickersService.getTicker({name: toInsert.name})).rejects.toThrowError('Value not found');
        });

        //other client try to add a quote using this ticker
        it('should return an error', async () => {
            await tickersService.addTicker(toInsert);

            let res = insertQuoteWithDelay(connection,new NewQuoteInput('1',1,1),200);
            //INSERT query was obtained before DELETE
            //we can't delete because there is some quote using this ticker
            await expect(tickersService.deleteTicker({name: toInsert.name})).rejects.toThrowError('The ticker is already used by some quotes. Try to delete quotes at first.');
            await res;
        });
    });

    describe('editTicker', () => {
        it('should return edited ticker', async () => {
            await tickersService.addTicker(toInsert);

            await expect(tickersService.editTicker(toEdit)).resolves.toEqual(toEdit);

            //check if ticker is in edited form in DB
            await expect(tickersService.getTicker({name: toInsert.name})).resolves.toEqual(toEdit);
        });

        //trying to edit nonexistent ticker
        it('should return an error', async () => {
            await expect(tickersService.editTicker({name: 'nonInDB',fullName: '1',description: '1'})).rejects.toThrowError('Value not found');
        });

        //other client adds the ticker
        //we want to edit it
        it('should return an error', async () => {
            let res = insertWithDelay(connection,toInsert,200);
            await expect(tickersService.editTicker(toEdit)).rejects.toThrowError('Value not found');
            await res;

            //transaction ended so we can edit ticker
            await expect(tickersService.editTicker(toEdit)).resolves.toEqual(toEdit);
        });

        //other client deleted ticker
        //we want to edit it
        it('should return an error', async () => {
            //add testing ticker
            await tickersService.addTicker(toInsert);

            let res = deleteWithDelay(connection,{name: toInsert.name}, 200);
            //DELETE is run before EDIT
            //EDIT waits until transaction ends
            //if it ends the ticker is deleted so there is nothing to edit
            await expect(tickersService.editTicker(toEdit)).rejects.toThrowError('Value not found');
            await res;
        });

        //other client edit ticker
        it('should return an edited ticker by us', async () => {
            //add testing ticker
            await tickersService.addTicker(toInsert);
            const toEdit2 = new NewTickerInput('1', 'edited2','edited2');

            let res = editWithDelay(connection,toEdit, 200);
            await expect(tickersService.editTicker(toEdit2)).resolves.toEqual(toEdit2);
            await res;

            //let's check the ticker in DB
            await expect(tickersService.getTicker({name: toInsert.name})).resolves.toEqual(toEdit2);
        });
    });

});