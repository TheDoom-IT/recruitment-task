import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Quote } from "./models/quote.model";
import { NewQuoteInput } from "./dto/new-quote.input";
import { FindQuoteInput } from "./dto/find-quote.input";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class QuotesService {
    constructor(private database: DatabaseService) { }

    async addQuote(newQuote: NewQuoteInput) {
        //Check if such a ticker is served by the API
        await this.database.findTicker({ name: newQuote.name })
            .then((res) => {
                if (res === undefined) {
                    throw new BadRequestException('The ticker of the given name is not served by the API. Try to add a ticker first.');
                }
            });

        //Check if such an item exists in the database
        await this.database.findQuote(newQuote).then((res) => {
            if (res !== undefined) {
                throw new BadRequestException('The quote with the given name and timespamt already exists.');
            }
        });
        //insert into the database
        return this.database.insertQuote(newQuote)
            .then((res) => {
                return { ...newQuote };
            })
    }

    async getQuotes(): Promise<Quote[]> {
        return this.database.findQuotes();
    }


    async getQuote(toGet: FindQuoteInput): Promise<Quote> {
        return this.database.findQuote(toGet).then((res) => {
            if (res === undefined) {
                throw new NotFoundException('Value not found.');
            }
            return res;
        });
    }

    async deleteQuote(toDelete: FindQuoteInput) {
        //check if such a quote exists
        //find quote throw an exception if there is no such a quote
        const quoteToDelete = await this.getQuote(toDelete);

        return this.database.deleteQuote(toDelete)
            .then(res => {
                return quoteToDelete;
            })
    }

    async editQuote(editQuote: NewQuoteInput) {
        //check if such a quote exists
        await this.getQuote({ name: editQuote.name, timestamp: editQuote.timestamp });

        return this.database.editQuote(editQuote)
            .then(res => {
                return { ...editQuote };
            })
    }
}