import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatabaseException } from "../exceptions/database.exception";
import { FindQuoteInput } from "../quotes/dto/find-quote.input";
import { NewQuoteInput } from "../quotes/dto/new-quote.input";
import { Quote } from "../quotes/models/quote.model";
import { FindTickerInput } from "../tickers/dto/find-ticker.input";
import { NewTickerInput } from "../tickers/dto/new-ticker.input";
import { Repository } from "typeorm";
import { QuoteEntity } from "../quotes/quotes.entity";
import { TickerEntity } from "../tickers/tickers.entity";

@Injectable()
export class DatabaseService {
    constructor(
        @InjectRepository(QuoteEntity)
        private quotesRepository: Repository<QuoteEntity>,
        @InjectRepository(TickerEntity)
        private tickersRepository: Repository<TickerEntity>
    ){}

    async findQuote(toFind: FindQuoteInput){
        return this.quotesRepository.findOne({
            where: {...toFind}
        }).catch(error => {
            throw new DatabaseException();
        })
    }

    async findTicker(toFind: FindTickerInput){
        return this.tickersRepository.findOne({
            where: {...toFind}
        }).catch(error => {
            throw new DatabaseException();
        })
    }

    async findQuotes(): Promise<Quote[]>{
        return this.quotesRepository.find()
        .catch((error) => {
            throw new DatabaseException();
        });
    }

    async findTickers(){
        return this.tickersRepository.find()
            .catch(error => {
                throw new DatabaseException();
            })
    }

    async insertQuote(newQuote: NewQuoteInput){
        return this.quotesRepository.insert({...newQuote})
        .catch(error => {
            console.log(error.detail);
            if(error.detail === `Key (name, "timestamp")=(${newQuote.name}, ${newQuote.timestamp}) already exists.`){
                return;
            }
            throw new DatabaseException();
        })
    }

    async insertTicker(newTicker: NewTickerInput){
        return this.tickersRepository.insert({...newTicker})
        .catch(error => {
            /*  addQuote check if there is such a ticker before calling insertTicker
                but it may happen that some other client between my two calls to the DB
                already added this ticker:

                database might obtain queries in such an order:
                1st query by me - SELECT * FROM ticker WHERE ticker = 'someName'; - it returns empty table, so we can try to add new ticker
                2nd query by another client - INSERT INTO ticker VALUES('someName'...); - new ticker is added
                3rd query by me - INSERT INTO ticker VALUES ('someName'...); - I try to add the same ticker!!!

                In this case DB returns an error, "Key (name)=(someName) already exists."
                If such an error is returned I can proceed to adding 'quotes' and both of the quotes will be added

                Problems:
                1. if version of PostrgreSQL change, the error messages may also change. 
                The program will not work properly after such an upgrade
                
                2. Two clients may concurrently try to add ticker(by using addTicker query) with the same name,
                but different descriptions:
                - for first client the program checks if such a ticker exists and it does not
                - for second client the program checks if such a ticker exists and it does not
                - the server concurrently call insertTicker function for both of the clients
                The ticker of the first client is added to the DB. In the case of second client the 
                error is catched (Key (name)=('someName') already exists.) and no information is sent about such a situation.
                The second client may check if ticker was succesfully added(by using getTicker).
                But it found out that it returns ticker with different description than it was passed to addTicker!!!
                Should we inform the client that someone else tries to add the same ticker in the same time
                or such a situation is acceptable?
                The same situation may take place with addQuote query
             */
            if(error.detail === `Key (name)=(${newTicker.name}) already exists.`){
                return;
            }
            throw new DatabaseException();
        })
    }

    async deleteQuote(toDelete: FindQuoteInput){
        return this.quotesRepository.delete({...toDelete})
            .catch(error => {
            throw new DatabaseException();
        })
    }

    async deleteTicker(toDelete: FindTickerInput){
        return this.tickersRepository.delete({...toDelete})
            .catch(error => {
            throw new DatabaseException();
        })
    }

    async editQuote(toEdit: NewQuoteInput) {
        return this.quotesRepository.update({
            name: toEdit.name,
            timestamp: toEdit.timestamp,
        }, {...toEdit})
            .catch((error) => {
                throw new DatabaseException();
            });
    }

    async editTicker(toEdit: NewTickerInput){
        return this.tickersRepository.update({
            name: toEdit.name,
        }, {...toEdit})
            .catch(error => {
                throw new DatabaseException();
            })
    }

    //check if ticker is used in some of the quotes
    async isTickerInUse(toCheck: FindTickerInput):Promise<boolean>{
        return this.quotesRepository.findOne({
            where: {
                name: toCheck.name,
            }
        })
        .then(res => {
            if(res === undefined){
                return false;
            }
            return true;
        })
    }
}