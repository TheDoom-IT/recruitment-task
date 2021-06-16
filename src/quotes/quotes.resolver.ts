import { Args, Query, Mutation, Float, Resolver } from "@nestjs/graphql";
import { ValidatePrice } from "src/validation/validation.price";
import { ValidateString } from "src/validation/validation.string";
import { ValidateTime } from "src/validation/validation.time";
import { Quote } from "./models/quote.model";
import { QuotesService } from "./quotes.service";

@Resolver(of => Quote)
export class QuotesResolver {
    constructor(private quotesService: QuotesService) { }

    @Query(returns => Quote)
    async getQuote(
        @Args('name', ValidateString) name: string,
        @Args('time', ValidateTime) time: string
    ) {
        return this.quotesService.getQuote(name,time);
    }

    @Mutation(returns => Quote)
    async addQuote(
        @Args('name', ValidateString) name: string,
        @Args('time', ValidateTime) time: string,
        @Args({ name: 'price', type: () => Float }, ValidatePrice) price: number
    ) {
            return this.quotesService.addQuote(name,time,price);
    }
}