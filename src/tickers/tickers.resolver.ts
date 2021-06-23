import { Args, Query, Mutation, Resolver } from "@nestjs/graphql";
import { ParseFindTicker } from "../validation/validation.find-ticker";
import { ParseNewTicker } from "../validation/validation.new-ticker";
import { FindTickerInput } from "./dto/find-ticker.input";
import { NewTickerInput } from "./dto/new-ticker.input";
import { Ticker } from "./models/ticker.model";
import { TickersService } from "./tickers.service";

@Resolver(of => Ticker)
export class TickersResolver {
    constructor(private tickerService: TickersService) { }

    @Query(returns => Ticker)
    async getTicker(@Args('get', ParseFindTicker) toGet: FindTickerInput){
        return await this.tickerService.getTicker(toGet);
    }

    @Query(returns => [Ticker])
    async getTickers(){
        return await this.tickerService.getTickers();
    }

    @Mutation(returns => Ticker)
    async addTicker(@Args('new', ParseNewTicker) newTicker: NewTickerInput){
        return await this.tickerService.addTicker(newTicker);
    }

    @Mutation(returns => Ticker)
    async deleteTicker(@Args('delete', ParseFindTicker) toDelete: FindTickerInput){
        return await this.tickerService.deleteTicker(toDelete);
    }

    @Mutation(returns => Ticker)
    async editTicker(@Args('edit', ParseNewTicker) toEdit: NewTickerInput){
        return await this.tickerService.editTicker(toEdit);
    }
}