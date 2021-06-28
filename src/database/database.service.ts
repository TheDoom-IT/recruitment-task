import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatabaseException } from "../exceptions/database.exception";
import { FindQuoteInput } from "../quotes/dto/find-quote.input";
import { NewQuoteInput } from "../quotes/dto/new-quote.input";
import { Quote } from "../quotes/models/quote.model";
import { FindTickerInput } from "../tickers/dto/find-ticker.input";
import { NewTickerInput } from "../tickers/dto/new-ticker.input";
import { Connection, Repository } from "typeorm";
import { QuoteEntity } from "../quotes/quotes.entity";
import { TickerEntity } from "../tickers/tickers.entity";
import { maxRetries } from "../constants";

@Injectable()
export class DatabaseService {
    constructor(
        @InjectRepository(QuoteEntity)
        private quotesRepository: Repository<QuoteEntity>,
        @InjectRepository(TickerEntity)
        private tickersRepository: Repository<TickerEntity>,
        private connection: Connection
    ) { }

    async findQuote(toFind: FindQuoteInput) {
        return this.quotesRepository.findOne({
            where: { ...toFind }
        }).catch(error => {
            throw new DatabaseException();
        })
    }

    async findTicker(toFind: FindTickerInput) {
        return this.tickersRepository.findOne({
            where: { ...toFind }
        }).catch(error => {
            throw new DatabaseException();
        })
    }

    async findQuotes(): Promise<Quote[]> {
        return this.quotesRepository.find()
            .catch((error) => {
                throw new DatabaseException();
            });
    }

    async findTickers() {
        return this.tickersRepository.find()
            .catch(error => {
                throw new DatabaseException();
            })
    }

    async insertQuote(newQuote: NewQuoteInput) {
        return this.quotesRepository.insert({ ...newQuote })
            .catch(error => {
                throw new DatabaseException();
            })
    }

    async insertTicker(newTicker: NewTickerInput) {
        return this.tickersRepository.insert({ ...newTicker })
            .catch(error => {
                throw new DatabaseException();
            })
    }

    //tries to add ticker
    //return true if succed
    //false if ticker is already in DB
    async tryAddTicker(newTicker: NewTickerInput): Promise<boolean> {

        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        let toReturn: boolean;
        let n = 0;
        while (true) {
            await queryRunner.startTransaction('SERIALIZABLE');

            n++;
            if (n === maxRetries) {
                throw new InternalServerErrorException('Database request limit reached');
            }
            try {
                toReturn = await queryRunner.manager.findOne(TickerEntity, {
                    where: {
                        name: newTicker.name
                    }
                }).then(async res => {
                    //ticker is inside the DB
                    if (res !== undefined) {
                        await queryRunner.rollbackTransaction();
                        return false;
                    }

                    //try to add ticker
                    await queryRunner.manager.insert(TickerEntity, { ...newTicker });
                    await queryRunner.commitTransaction();
                    return true;
                });

                //try block was succesfull
                //while loop can be broken
                break;
            } catch (err) {
                await queryRunner.rollbackTransaction();
                
                //unique_violation error
                //such a ticker is inside the DB
                if(err.code === '23505'){
                    toReturn = false;
                    break;
                }

                //40001 - serialization_failure
                //transaction should be repeated
                //otherwise throw an exception
                if (err.code !== '40001') {
                    throw new DatabaseException();
                }

                //small delay before next try
                await new Promise(f => setTimeout(f,100));
            }
            //transaction repeats...
        }

        await queryRunner.release();
        return toReturn;
    }

    //tries to add quote
    //return true if succed
    //false if quote is in DB
    async tryAddQuote(newQoute: NewQuoteInput): Promise<boolean> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        let toReturn: boolean;
        let n = 0;
        while (true) {
            await queryRunner.startTransaction('SERIALIZABLE');
            n++;
            if (n === maxRetries) {
                throw new InternalServerErrorException('Database request limit reached');
            }
            try {
                toReturn = await queryRunner.manager.findOne(QuoteEntity, {
                    where: {
                        name: newQoute.name,
                        timestamp: newQoute.timestamp
                    }
                }).then(async res => {
                    //quote already exist
                    if (res !== undefined) {
                        queryRunner.rollbackTransaction();
                        return false;
                    }

                    await queryRunner.manager.insert(QuoteEntity, { ...newQoute });
                    await queryRunner.commitTransaction();
                    return true;
                });
                //try block succed
                //while loop can be broken
                break;
            } catch (err) {
                await queryRunner.rollbackTransaction();

                //unique_violation error
                //such a quote is inside the DB
                if(err.code === '23505'){
                    toReturn = false;
                    break;
                }
                //40001 - serialization_failure
                //transaction should be repeated
                //otherwise throw an exception
                if (err.code !== '40001') {
                    throw new DatabaseException();
                }
                
                //small delay before next try
                await new Promise(f => setTimeout(f,100));
            }
            //transaction repeats...
        }

        await queryRunner.release();
        return toReturn;
    }

    async deleteQuote(toDelete: FindQuoteInput) {
        return this.quotesRepository.delete({ ...toDelete })
            .catch(error => {
                throw new DatabaseException();
            })
    }

    async deleteTicker(toDelete: FindTickerInput) {
        return this.tickersRepository.delete({ ...toDelete })
            .catch(error => {
                throw new DatabaseException();
            })
    }

    async editQuote(toEdit: NewQuoteInput) {
        return this.quotesRepository.update({
            name: toEdit.name,
            timestamp: toEdit.timestamp,
        }, { ...toEdit })
            .catch((error) => {
                throw new DatabaseException();
            });
    }

    async editTicker(toEdit: NewTickerInput) {
        return this.tickersRepository.update({
            name: toEdit.name,
        }, { ...toEdit })
            .catch(error => {
                throw new DatabaseException();
            })
    }

    //check if ticker is used in some of the quotes
    async isTickerInUse(toCheck: FindTickerInput): Promise<boolean> {
        return this.quotesRepository.findOne({
            where: {
                name: toCheck.name,
            }
        })
            .then(res => {
                if (res === undefined) {
                    return false;
                }
                return true;
            })
    }
}