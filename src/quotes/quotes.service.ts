import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Quote } from "./models/quote.model";
import { DatabaseException } from "../exceptions/database.exception";

@Injectable()
export class QuotesService {
    constructor(
        @InjectRepository(Quote)
        private quotesRepository: Repository<Quote>,
    ) { }

    async addQuote(name: string, timestamp: number, price: number) {
        //Check if such an item exists in the database
        await this.quotesRepository.findOne({
            where: {
                name: name,
                timestamp: timestamp,
            }
        }).catch((error) => {
            throw new DatabaseException();
        }).then((res) => {
            if (res !== undefined) {
                throw new BadRequestException('The quote with the given name and timespamt already exists.');
            }
        });

        return this.quotesRepository.insert({
            name: name,
            timestamp: timestamp,
            price: price,
        })
            .then((res) => {
                return new Quote(name, timestamp, price);
            })
            .catch((error) => {
                throw new DatabaseException();
            });

    }

    async getQuotes(): Promise<Quote[]> {
        return this.quotesRepository.find()
            .catch((error) => {
                throw new DatabaseException();
            });
    }


    async getQuote(name: string, timestamp: number): Promise<Quote> {
        return this.quotesRepository.findOne({
            where: {
                name: name,
                timestamp: timestamp,
            }
        })
        .catch((error) => {
            throw new DatabaseException();
        }).then((res) => {
            if (res === undefined) {
                throw new HttpException('Value not found.', HttpStatus.NOT_FOUND);
            }
            return res;
        });
    }
}