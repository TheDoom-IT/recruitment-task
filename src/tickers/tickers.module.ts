import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuoteEntity } from "../quotes/quotes.entity";
import { TickerEntity } from "./tickers.entity";
import { TickersResolver } from "./tickers.resolver";
import { TickersService } from "./tickers.service";

@Module({
    imports: [TypeOrmModule.forFeature([TickerEntity,QuoteEntity])],
    providers: [TickersService, TickersResolver]
})
export class TickersModule {}