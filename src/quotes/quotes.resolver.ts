import { Args, Query, Mutation, Float, Resolver } from "@nestjs/graphql";
import { ValidatePrice } from "../validation/validation.price";
import { ValidateName } from "../validation/validation.name";
import { ValidateTimestamp } from "../validation/validation.timestamp";
import { Quote } from "./models/quote.model";
import { QuotesService } from "./quotes.service";

@Resolver(of => Quote)
export class QuotesResolver {
    constructor(private quotesService: QuotesService) { }

    @Query(returns => Quote)
    async getQuote(
        @Args('name', ValidateName) name: string,
        @Args('timestamp', ValidateTimestamp) timestamp: number
    ) {
        return this.quotesService.getQuote(name,timestamp);
    }

    @Query(returns => [Quote])
    async getQuotes(){
        return this.quotesService.getQuotes();
    }

    @Mutation(returns => Quote)
    async addQuote(
        @Args('name', ValidateName) name: string,
        @Args('timestamp', ValidateTimestamp) timestamp: number,
        @Args({ name: 'price', type: () => Float }, ValidatePrice) price: number
    ) {
            return this.quotesService.addQuote(name,timestamp,price);
    }

    @Mutation(returns => Quote)
    async deleteQuote(
        @Args('name', ValidateName) name: string,
        @Args('timestamp', ValidateTimestamp) timestamp: number
    ){
        return this.quotesService.deleteQuote(name,timestamp);
    }

    @Mutation(returns => Quote)
    async editQuote(
        @Args('name', ValidateName) name: string,
        @Args('timestamp', ValidateTimestamp) timestamp: number,
        @Args('newPrice', ValidatePrice) newPrice: number,
    )
    {
        return this.quotesService.editQuote(name, timestamp, newPrice);
    }
}