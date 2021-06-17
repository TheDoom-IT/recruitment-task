import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Quote } from "./models/quote.model";

@Injectable()
export class QuotesService {
    constructor(
        @InjectRepository(Quote)
        private quotesRepository: Repository<Quote>,
    ) { }

    async addQuote(name: string, timestamp: number, price: number) {
    
        return this.quotesRepository.query(
            `INSERT INTO quote VALUES ('${name}', '${timestamp}', ${price});`)
            .then((res) => {
                return new Quote(name,timestamp,price);
            })
            .catch((error) => {
                throw new HttpException(error.message + ' ' + error.detail, HttpStatus.NOT_ACCEPTABLE);
            });
    }

    async getQuotes(): Promise<Quote[]> {
        return this.quotesRepository.find();
    }

    async getQuote(name: string, timestamp: number): Promise<Quote> {
        return this.quotesRepository.findOne({
            where: {
                name: name,
                timestamp: timestamp,
            }
        }).then((res) => {
            if(res === undefined){
                throw new HttpException('Value not found.', HttpStatus.NOT_FOUND);
            }
            return res;
        });
    }
}