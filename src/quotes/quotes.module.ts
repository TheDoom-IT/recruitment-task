import { Module } from "@nestjs/common";
import { QuotesResolver } from "./quotes.resolver";
import { QuotesService } from "./quotes.service";

@Module({
    providers: [QuotesResolver, QuotesService]
})
export class QuotesModule {}