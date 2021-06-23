import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatabaseException } from "src/exceptions/database.exception";
import { FindQuoteInput } from "src/quotes/dto/find-quote.input";
import { NewQuoteInput } from "src/quotes/dto/new-quote.input";
import { Quote } from "src/quotes/models/quote.model";
import { FindTickerInput } from "src/tickers/dto/find-ticker.input";
import { NewTickerInput } from "src/tickers/dto/new-ticker.input";
import { Ticker } from "src/tickers/models/ticker.model";
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
            where: {name: toFind.name}
        }).catch(error => {
            throw new DatabaseException();
        })
    }

    async insertQuote(newQuote: NewQuoteInput){
        for(let x = 1; x < 1000; x++){
            await this.quotesRepository.insert({name: '7',
        timestamp: x,
        price: x,})
        }

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

    async findQuotes(): Promise<Quote[]>{
        return this.quotesRepository.find()
        .catch((error) => {
            throw new DatabaseException();
        });
    }

    async deleteQuote(toDelete: FindQuoteInput){
        return this.quotesRepository.delete({
            ...toDelete
        }).catch(error => {
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
}