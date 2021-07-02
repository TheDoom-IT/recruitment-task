import { BadRequestException, Injectable } from "@nestjs/common";
import { maxRetries } from "../constants";
import { DatabaseException } from "../exceptions/database.exception";
import { RequestLimitException } from "../exceptions/request-limit.exception";
import { ValueNotFoundException } from "../exceptions/value-not-found.exception";
import { QuoteEntity } from "../quotes/quotes.entity";
import { Connection } from "typeorm";
import { FindTickerInput } from "./dto/find-ticker.input";
import { NewTickerInput } from "./dto/new-ticker.input";
import { Ticker } from "./models/ticker.model";
import { TickerEntity } from "./tickers.entity";

@Injectable()
export class TickersService {
    constructor(private connection: Connection) { }

    async getTicker(toGet: FindTickerInput): Promise<Ticker> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        let toReturn: Ticker;
        try {
            toReturn = await queryRunner.manager.findOne(TickerEntity, { where: { ...toGet } });
        } catch (err) {
            throw new DatabaseException();
        } finally {
            await queryRunner.release();
        }

        if(toReturn === undefined) {
            throw new ValueNotFoundException();
        }

        return toReturn;
    }

    async getTickers(): Promise<Ticker[]> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        try {
            return await queryRunner.manager.find(TickerEntity);
        } catch (err) {
            throw new DatabaseException();
        } finally {
            await queryRunner.release();
        }
    }

    //tries to add ticker
    //return true if succed
    //false if ticker is already in DB
    async addTicker(newTicker: NewTickerInput) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        let n = 0;
        while (true) {
            if (n++ > maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try {
                await queryRunner.startTransaction('SERIALIZABLE');
                //check if ticker is in DB
                if (await queryRunner.manager.findOne(TickerEntity, { where: { name: newTicker.name } }) !== undefined) {
                    throw new BadRequestException('The ticker with the given name already exists.');
                }

                //try to add ticker
                await queryRunner.manager.insert(TickerEntity, { ...newTicker });
                //transaction can be commited
                await queryRunner.commitTransaction();
                await queryRunner.release();

                //transaction was succesful
                //while loop can be broken
                break;
            } catch (err) {
                //if any error occured the transcation has to be rollbacked
                await queryRunner.rollbackTransaction();

                //errors thrown not by DB should be re-thrown
                if (err instanceof BadRequestException) {
                    await queryRunner.release();
                    throw err;
                }

                //23505 - unique_violation error
                //such a ticker is inside the DB
                //in some cases 23505 code is thrown instead of 40001 i am not sure why
                //in such a case transaction can be repated and BadRequestException will be thrown

                //40001 - serialization_failure
                //transaction should be repeated
                //otherwise throw an exception
                if (err.code !== '40001' && err.code !== '23505') {
                    await queryRunner.release();
                    throw new DatabaseException();
                }

                //small delay before next try
                await new Promise(f => setTimeout(f, 100));
            }
            //transcation repeats...
        }

        return newTicker;
    }

    async deleteTicker(toDelete: FindTickerInput): Promise<Ticker> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        //save ticker which will be returned
        let toReturn: Ticker;
        let n = 0;
        while (true) {
            if (n++ > maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try {
                await queryRunner.startTransaction('SERIALIZABLE');
                //check if such a ticker exists
                toReturn = await queryRunner.manager.findOne(TickerEntity, { where: { ...toDelete } });
                //there in no such ticker in DB
                if (toReturn === undefined) {
                    throw new ValueNotFoundException();
                }

                //check if ticker is used by some quote
                if(await queryRunner.manager.findOne(QuoteEntity, { where: { name: toDelete.name } }) !== undefined) {
                    throw new BadRequestException('The ticker is already used by some quotes. Try to delete quotes at first.');
                }

                //try to delete
                await queryRunner.manager.delete(TickerEntity, { ...toDelete });
                await queryRunner.commitTransaction();
                await queryRunner.release();

                //succesful transaction
                //no additional trial is needed
                break;
            } catch (err) {
                await queryRunner.rollbackTransaction();

                if (err instanceof ValueNotFoundException || err instanceof BadRequestException) {
                    await queryRunner.release();
                    throw err;
                }

                if (err.code != '40001') {
                    await queryRunner.release();
                    throw new DatabaseException();
                }

                //small delay before next try
                await new Promise(f => setTimeout(f, 100));
            }
        }
        return toReturn;
    }

    async editTicker(toEdit: NewTickerInput): Promise<Ticker> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        let n = 0;
        while (true) {
            if (n++ > maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try {
                await queryRunner.startTransaction('SERIALIZABLE');
                //check if ticker exists
                if(await queryRunner.manager.findOne(TickerEntity, { where: { name: toEdit.name } }) === undefined) {
                    throw new ValueNotFoundException();
                }

                //try to update
                await queryRunner.manager.update(TickerEntity, { name: toEdit.name }, { ...toEdit });
                await queryRunner.commitTransaction();
                await queryRunner.release();

                //try block succeeded
                //while lopp can be broken
                break;
            } catch (err) {
                await queryRunner.rollbackTransaction();

                if (err instanceof ValueNotFoundException) {
                    queryRunner.release();
                    throw err;
                }

                if (err.code !== '40001') {
                    await queryRunner.release();
                    throw new DatabaseException();
                }

                //small delay before next try
                await new Promise(f => setTimeout(f, 100));
            }
        }

        return toEdit;
    }
}