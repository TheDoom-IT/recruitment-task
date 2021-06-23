import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { TickersResolver } from "./tickers.resolver";
import { TickersService } from "./tickers.service";

@Module({
    imports: [DatabaseModule],
    providers: [TickersService, TickersResolver]
})
export class TickersModule {}