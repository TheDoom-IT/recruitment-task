import { Args, Query, Mutation, Resolver } from "@nestjs/graphql";
import { Quote } from "./models/quote.model";
import { QuotesService } from "./quotes.service";
import { NewQuoteInput } from "./dto/new-quote.input";
import { FindQuoteInput } from "./dto/find-quote.input";
import { Ticker } from "src/tickers/models/ticker.model";
import { NewTickerInput } from "src/tickers/dto/new-ticker.input";

@Resolver(of => Quote)
export class QuotesResolver {
    constructor(private quotesService: QuotesService) { }

    @Query(returns => Quote)
    async getQuote(@Args('get') toGet: FindQuoteInput,) {
        return await this.quotesService.getQuote(toGet);
    }

    @Query(returns => [Quote])
    async getQuotes() {
        return await this.quotesService.getQuotes();
    }

    @Mutation(returns => Quote)
    async addQuote(@Args('new') newQuote: NewQuoteInput) {
        return await this.quotesService.addQuote(newQuote);
    }

    @Mutation(returns => Ticker)
    async addTicker(@Args('new') newTicker: NewTickerInput){
        return await this.quotesService.addTicker(newTicker);
    }

    @Mutation(returns => Quote)
    async deleteQuote(@Args('delete') toDelete: FindQuoteInput) {
        return await this.quotesService.deleteQuote(toDelete);
    }

    @Mutation(returns => Quote)
    async editQuote(@Args('edit') updateQuote: NewQuoteInput) {
        return await this.quotesService.editQuote(updateQuote);
    }
}