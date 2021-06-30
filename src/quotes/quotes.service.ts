import { BadRequestException, Injectable } from "@nestjs/common";
import { Quote } from "./models/quote.model";
import { NewQuoteInput } from "./dto/new-quote.input";
import { FindQuoteInput } from "./dto/find-quote.input";
import { Connection } from "typeorm";
import { QuoteEntity } from "./quotes.entity";
import { ValueNotFoundException } from "../exceptions/value-not-found.exception";
import { DatabaseException } from "../exceptions/database.exception";
import { TickerEntity } from "../tickers/tickers.entity";
import { RequestLimitException } from "../exceptions/request-limit.exception";
import { maxRetries } from "../constants";

@Injectable()
export class QuotesService {
    constructor(private connection: Connection) { }

    //tries to add quote
    //return true if succed
    //false if quote is in DB
    async addQuote(newQuote: NewQuoteInput): Promise<Quote> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        let n = 0;
        while (true) {
            if (n++ >= maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try {
                await queryRunner.startTransaction('SERIALIZABLE');
                //check if ticker exists
                await queryRunner.manager.findOne(TickerEntity, { where: { name: newQuote.name } }).then(async res => {
                    //if ticker is in db we can continue
                    if (res !== undefined) {
                        return;
                    }

                    //if not we should add it
                    await queryRunner.manager.insert(TickerEntity, { name: newQuote.name, fullName: 'unknown', description: 'unknown', });
                });


                await queryRunner.manager.findOne(QuoteEntity, { where: { name: newQuote.name, timestamp: newQuote.timestamp } }).then(res => {
                    //quote already exist
                    if (res !== undefined) {
                        throw new BadRequestException('The quote with the given name and timespamt already exists.');
                    }
                });

                await queryRunner.manager.insert(QuoteEntity, { ...newQuote });
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

        return newQuote;
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


    async getQuote(toGet: FindQuoteInput): Promise<Quote> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        return queryRunner.manager.findOne(QuoteEntity, { where: { ...toGet } }).then(res => {
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

    //tries to delete quote
    //returns deleted quote
    async deleteQuote(toDelete: FindQuoteInput): Promise<Quote> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        //save quote which will be returned
        let toReturn: Quote;
        let n = 0;
        while (true) {
            if (n++ >= maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try {
                await queryRunner.startTransaction('SERIALIZABLE');
                await queryRunner.manager.findOne(QuoteEntity, { where: { ...toDelete } }).then(res => {
                    //there in no such a quote in DB
                    if (res === undefined) {
                        throw new ValueNotFoundException();
                    }

                    //saves quote to return later
                    toReturn = res;
                });

                //try to delete
                await queryRunner.manager.delete(QuoteEntity, { ...toDelete });
                await queryRunner.commitTransaction();
                await queryRunner.release();

                //succesful transaction
                //no additional trial is needed
                break;
            } catch (err) {
                await queryRunner.rollbackTransaction();

                if (err instanceof ValueNotFoundException) {
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

    async editQuote(toUpdate: NewQuoteInput): Promise<Quote> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        //save quote which will be returned
        let n = 0;
        while (true) {
            if (n++ >= maxRetries) {
                await queryRunner.release();
                throw new RequestLimitException();
            }

            try {
                await queryRunner.startTransaction('SERIALIZABLE');
                //check if quote exists
                await queryRunner.manager.findOne(QuoteEntity, { where: { name: toUpdate.name, timestamp: toUpdate.timestamp } }).then(res => {
                    if (res === undefined) {
                        throw new ValueNotFoundException();
                    }
                });

                //try to edit
                await queryRunner.manager.update(QuoteEntity, { name: toUpdate.name, timestamp: toUpdate.timestamp }, { ...toUpdate });
                await queryRunner.commitTransaction();
                await queryRunner.release();

                //succesful transaction
                //no additional trial is needed
                break;
            } catch (err) {
                await queryRunner.rollbackTransaction();

                if (err instanceof ValueNotFoundException) {
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

        return toUpdate;
    }
}