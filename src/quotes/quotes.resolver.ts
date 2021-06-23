import { Args, Query, Mutation, Resolver } from "@nestjs/graphql";
import { Quote } from "./models/quote.model";
import { QuotesService } from "./quotes.service";
import { NewQuoteInput } from "./dto/new-quote.input";
import { FindQuoteInput } from "./dto/find-quote.input";
import { ParseNewQuote } from "../validation/validation.new-quote";
import { ParseFindQuote } from "../validation/validation.find-quote";

@Resolver(of => Quote)
export class QuotesResolver {
    constructor(private quotesService: QuotesService) { }

    @Query(returns => Quote)
    async getQuote(@Args('get', ParseFindQuote) toGet: FindQuoteInput,) {
        return await this.quotesService.getQuote(toGet);
    }

    @Query(returns => [Quote])
    async getQuotes() {
        return await this.quotesService.getQuotes();
    }

    @Mutation(returns => Quote)
    async addQuote(@Args('new', ParseNewQuote) newQuote: NewQuoteInput) {
        return await this.quotesService.addQuote(newQuote);
    }

    @Mutation(returns => Quote)
    async deleteQuote(@Args('delete', ParseFindQuote) toDelete: FindQuoteInput) {
        return await this.quotesService.deleteQuote(toDelete);
    }

    @Mutation(returns => Quote)
    async editQuote(@Args('edit', ParseNewQuote) updateQuote: NewQuoteInput) {
        return await this.quotesService.editQuote(updateQuote);
    }
}