import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseException } from "../exceptions/database.exception";
import { FindQuoteInput } from "../quotes/dto/find-quote.input";
import { NewQuoteInput } from "../quotes/dto/new-quote.input";
import { Quote } from "../quotes/models/quote.model";
import { FindTickerInput } from "../tickers/dto/find-ticker.input";
import { NewTickerInput } from "../tickers/dto/new-ticker.input";
import { Connection } from "typeorm";
import { QuoteEntity } from "../quotes/quotes.entity";
import { TickerEntity } from "../tickers/tickers.entity";
import { maxRetries } from "../constants";
import { RequestLimitException } from "../exceptions/request-limit.exception";
import { Ticker } from "../tickers/models/ticker.model";
import { ValueNotFoundException } from "../exceptions/value-not-found.exception";

@Injectable()
export class DatabaseService {
    constructor(
        private connection: Connection
    ) { }

    async getQuote(toFind: FindQuoteInput) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        return queryRunner.manager.findOne(QuoteEntity, { where: { ...toFind } }).then(res => {
            if (res === undefined) {
                throw new ValueNotFoundException();
            }

            return res;
        }).catch(err => {
            if (err instanceof ValueNotFoundException) {
                throw err;
            }

            throw new DatabaseException();
        }).finally(async () => {
            await queryRunner.release();
        });
    }

    async getTicker(toFind: FindTickerInput) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        return queryRunner.manager.findOne(TickerEntity, { where: { ...toFind } }).then(res => {
            if (res === undefined) {
                throw new ValueNotFoundException();
            }

            return res;
        }).catch(err => {
            if (err instanceof ValueNotFoundException) {
                throw err;
            }

            throw new DatabaseException();
        }).finally(async () => {
            await queryRunner.release();
        });
    }

    async getQuotes(): Promise<Quote[]> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        return queryRunner.manager.find(QuoteEntity).catch(err => {
            throw new DatabaseException();
        }).finally(async () => {
            await queryRunner.release();
        });
    }

    async getTickers(): Promise<Ticker[]> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        return queryRunner.manager.find(TickerEntity).catch(err => {
            throw new DatabaseException();
        }).finally(async () => {
            await queryRunner.release();
        });
    }

    //tries to add ticker
    //return true if succed
    //false if ticker is already in DB
    async addTicker(newTicker: NewTickerInput) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        let n = 0;
        while (true) {
            n++;
            if (n >= maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try {
                await queryRunner.startTransaction('SERIALIZABLE');
                await queryRunner.manager.findOne(TickerEntity, { where: { name: newTicker.name } }).then(res => {
                    //ticker is in DB
                    if (res !== undefined) {
                        throw new BadRequestException('The ticker with the given name already exists.');
                    }
                });

                //try to add ticker
                await queryRunner.manager.insert(TickerEntity, { ...newTicker });
                //transaction can be commited if insert does not throw any error
                await queryRunner.commitTransaction();
                await queryRunner.release();

                //transaction was succesful
                //while loop can be broken
                break;
            } catch (err) {
                //if any error occured the transcation has to be rollbacked
                queryRunner.rollbackTransaction();

                //errors thrown not by DB should be re-thrown
                if (err instanceof BadRequestException) {
                    await queryRunner.release();
                    throw err;
                }

                //unique_violation error
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
    }

    //tries to add quote
    //return true if succed
    //false if quote is in DB
    async addQuote(newQoute: NewQuoteInput) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        let n = 0;
        while (true) {
            n++;
            if (n === maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try {
                await queryRunner.startTransaction('SERIALIZABLE');
                //check if ticker exists
                await queryRunner.manager.findOne(TickerEntity, { where: { name: newQoute.name } }).then(async res => {
                    //if ticker is in db we can continue
                    if (res !== undefined) {
                        return;
                    }

                    //if not we should add it
                    await queryRunner.manager.insert(TickerEntity, { name: newQoute.name, fullName: 'unknown', description: 'unknown', });
                });


                await queryRunner.manager.findOne(QuoteEntity, { where: { name: newQoute.name, timestamp: newQoute.timestamp } }).then(res => {
                    //quote already exist
                    if (res !== undefined) {
                        throw new BadRequestException('The quote with the given name and timespamt already exists.');
                    }
                });

                await queryRunner.manager.insert(QuoteEntity, { ...newQoute });
                await queryRunner.commitTransaction();
                await queryRunner.release();
                //try block succed
                //while loop can be broken
                break;
            } catch (err) {
                await queryRunner.rollbackTransaction();

                if (err instanceof BadRequestException) {
                    await queryRunner.release();
                    throw err;
                }

                //40001 - serialization_failure
                //transaction should be repeated
                //otherwise throw an exception
                //23505 sometimes is thrown i am not sure why
                //transcation repeats and BadRequestException is thrown
                if (err.code !== '40001' && err.code !== '23505') {
                    await queryRunner.release();
                    throw new DatabaseException();
                }

                //small delay before next try
                await new Promise(f => setTimeout(f, 100));
            }
            //transaction repeats...
        }
    }

    //tries to delete quote
    //returns deleted quote
    async deleteQuote(toDelete: FindQuoteInput) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        //save quote which will be returned
        let toReturn: Quote;
        let n = 0;
        while (true) {
            n++;
            if (n >= maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try{
                await queryRunner.startTransaction('SERIALIZABLE');
                await queryRunner.manager.findOne(QuoteEntity,{where: {...toDelete}}).then(res => {
                    //there in no such a quote in DB
                    if(res === undefined){
                        throw new ValueNotFoundException();
                    }

                    //saves quote to return later
                    toReturn = res;
                });

                //try to delete
                await queryRunner.manager.delete(QuoteEntity,{...toDelete});
                await queryRunner.commitTransaction();
                await queryRunner.release();

                //succesful transaction
                //no additional trial is needed
                break;
            }catch(err){
                await queryRunner.rollbackTransaction();

                if(err instanceof ValueNotFoundException){
                    await queryRunner.release();
                    throw err;
                }

                console.log(err.code);
                if(err.code != '40001'){
                    await queryRunner.release();
                    throw new DatabaseException();
                }

                //small delay before next try
                await new Promise(f => setTimeout(f, 100));
            }
        }
        return toReturn;
    }

    async deleteTicker(toDelete: FindTickerInput) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        //save quote which will be returned
        let toReturn: Ticker;
        let n = 0;
        while (true) {
            n++;
            if (n >= maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try{
                await queryRunner.startTransaction('SERIALIZABLE');
                //check if such a ticker exists
                await queryRunner.manager.findOne(TickerEntity,{where: {...toDelete}}).then(res => {
                    //there in no such ticker in DB
                    if(res === undefined){
                        throw new ValueNotFoundException();
                    }

                    //saves ticker to return later
                    toReturn = res;
                });

                //check if ticker is not used by some quote
                await queryRunner.manager.findOne(QuoteEntity,{where: {name: toDelete.name}}).then(res => {
                    if(res !== undefined){
                        throw new BadRequestException('The ticker is already used by some quotes. Try to delete quotes at first. ');
                    }
                });

                //try to delete
                await queryRunner.manager.delete(TickerEntity,{...toDelete});
                await queryRunner.commitTransaction();
                await queryRunner.release();

                //succesful transaction
                //no additional trial is needed
                break;
            }catch(err){
                await queryRunner.rollbackTransaction();

                if(err instanceof ValueNotFoundException || err instanceof BadRequestException){
                    await queryRunner.release();
                    throw err;
                }

                console.log(err.code);
                if(err.code != '40001'){
                    await queryRunner.release();
                    throw new DatabaseException();
                }

                //small delay before next try
                await new Promise(f => setTimeout(f, 100));
            }
        }
        return toReturn;
    }

    async editQuote(toEdit: NewQuoteInput) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        //save quote which will be returned
        let n = 0;
        while (true) {
            n++;
            if (n >= maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try{
                await queryRunner.startTransaction('SERIALIZABLE');
                //check if quote exists
                await queryRunner.manager.findOne(QuoteEntity,{where: {name: toEdit.name, timestamp: toEdit.timestamp}}).then(res => {
                    if(res === undefined){
                        throw new ValueNotFoundException();
                    }
                });

                //try to edit
                await queryRunner.manager.update(QuoteEntity,{name: toEdit.name, timestamp: toEdit.timestamp},{...toEdit});
                await queryRunner.commitTransaction();
                await queryRunner.release();

                //succesful transaction
                //no additional trial is needed
                break;
            }catch(err){
                await queryRunner.rollbackTransaction();

                if(err instanceof ValueNotFoundException){
                    await queryRunner.release();
                    throw err;
                }

                console.log(err.code);
                if(err.code != '40001'){
                    await queryRunner.release();
                    throw new DatabaseException();
                }

                //small delay before next try
                await new Promise(f => setTimeout(f, 100));
            }
        }
    }

    async editTicker(toEdit: NewTickerInput) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        //save quote which will be returned
        let n = 0;
        while (true) {
            n++;
            if (n >= maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try{
                await queryRunner.startTransaction('SERIALIZABLE');
                //check if ticker exists
                await queryRunner.manager.findOne(TickerEntity,{where:{name: toEdit.name}}).then(res => {
                    if(res === undefined){
                        throw new ValueNotFoundException();
                    }
                });

                //try to update
                await queryRunner.manager.update(TickerEntity,{name: toEdit.name},{...toEdit});
                await queryRunner.commitTransaction();
                await queryRunner.release();

                break;
            }catch(err){
                await queryRunner.rollbackTransaction();

                console.log(err.code);
                if(err instanceof ValueNotFoundException){
                    queryRunner.release();
                    throw err;
                }

                if(err.code !== '40001'){
                    await queryRunner.release();
                    throw new DatabaseException();
                }

                //small delay before next try
                await new Promise(f => setTimeout(f, 100));
            }
        }
    }
}