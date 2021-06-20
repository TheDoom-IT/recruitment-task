import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Quote } from "./models/quote.model";
import { DatabaseException } from "../exceptions/database.exception";
import { Args } from "@nestjs/graphql";

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

    async deleteQuote(name: string, timestamp: number)
    {
        //check if such a quote exists
        const quoteToDelete = await this.getQuote(name, timestamp);

        return this.quotesRepository.delete({
            name: name,
            timestamp: timestamp
        }).then((res) => {
            return quoteToDelete;
        }).catch((error) => {
            throw new DatabaseException();
        });
    }

    async editQuote(name: string, timestamp: number, newPrice: number)
    {
        //check if such a quote exists
        await this.getQuote(name, timestamp);

        const newQuote = new Quote(name,timestamp, newPrice);
        return this.quotesRepository.update({
            name: name,
            timestamp: timestamp,
        },newQuote)
        .then((res) => {
            return newQuote;
        })
        .catch((error) => {
            throw new DatabaseException();
        });
    }
}