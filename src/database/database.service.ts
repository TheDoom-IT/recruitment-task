import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatabaseException } from "../exceptions/database.exception";
import { FindQuoteInput } from "../quotes/dto/find-quote.input";
import { NewQuoteInput } from "../quotes/dto/new-quote.input";
import { Quote } from "../quotes/models/quote.model";
import { FindTickerInput } from "../tickers/dto/find-ticker.input";
import { NewTickerInput } from "../tickers/dto/new-ticker.input";
import { Ticker } from "../tickers/models/ticker.model";
import { Repository } from "typeorm";

@Injectable()
export class DatabaseService {
    constructor(
        @InjectRepository(Quote)
        private quotesRepository: Repository<Quote>,
        @InjectRepository(Ticker)
        private tickersRepository: Repository<Ticker>
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
            throw new DatabaseException();
        })
    }

    async insertTicker(newTicker: NewTickerInput){
        return this.tickersRepository.insert({...newTicker})
        .catch(error => {
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