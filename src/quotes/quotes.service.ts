import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Quote } from "./models/quote.model";
import { NewQuoteInput } from "./dto/new-quote.input";
import { FindQuoteInput } from "./dto/find-quote.input";
import { DatabaseService } from "../database/database.service";
import { NewTickerInput } from "../tickers/dto/new-ticker.input";

@Injectable()
export class QuotesService {
    constructor(private database: DatabaseService) { }

    async addQuote(newQuote: NewQuoteInput) {

        await this.database.tryAddTicker(new NewTickerInput(newQuote.name,'unknown','unknown'));

        //insert into the database
        if(await this.database.tryAddQuote(newQuote) === false){
            throw new BadRequestException('The quote with the given name and timespamt already exists.');
        }
        //else
        return {...newQuote};
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