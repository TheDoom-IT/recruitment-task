import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Quote } from "./models/quote.model";

@Injectable()
export class QuotesService{
    constructor(
        @InjectRepository(Quote)
        private quotesRepository: Repository<Quote>,
    ) {}

    async addQuote(name: string, time: string, price: number) {
        console.log(`Trying to add ${name}`);
        
        return this.quotesRepository.query(`
        INSERT INTO quote VALUES ('${name}', '${time}', ${price});`)
        .then((res) => {console.log(res);});
    }

    async getQuotes(): Promise<Quote[]>{
        return this.quotesRepository.find();
    }

    async getQuote(name: string, time: string): Promise<Quote> {
        console.log(`Trying to get ${name}`);
        return this.quotesRepository.findOne({
            where: {
                name: name,
                time: time,
            }
        });
    }
}