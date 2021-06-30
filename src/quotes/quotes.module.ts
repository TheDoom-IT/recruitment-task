import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TickerEntity } from "../tickers/tickers.entity";
import { QuoteEntity } from "./quotes.entity";
import { QuotesResolver } from "./quotes.resolver";
import { QuotesService } from "./quotes.service";

@Module({
    imports: [TypeOrmModule.forFeature([TickerEntity,QuoteEntity])],
    providers: [QuotesResolver, QuotesService]
})
export class QuotesModule {}