import { Injectable } from "@nestjs/common";
import { Quote } from "./models/quote.model";
import { NewQuoteInput } from "./dto/new-quote.input";
import { FindQuoteInput } from "./dto/find-quote.input";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class QuotesService {
    constructor(private database: DatabaseService) { }

    async addQuote(newQuote: NewQuoteInput) {
        return this.database.addQuote(newQuote).then(res => {
            return {...newQuote};
        });
    }

    async getQuotes(): Promise<Quote[]> {
        return this.database.getQuotes();
    }


    async getQuote(toGet: FindQuoteInput): Promise<Quote> {
        return this.database.getQuote(toGet);
    }

    async deleteQuote(toDelete: FindQuoteInput) {
        return this.database.deleteQuote(toDelete);
    }

    async editQuote(editQuote: NewQuoteInput) {
        return this.database.editQuote(editQuote).then(res => {
            return {...editQuote};
        })
    }
}