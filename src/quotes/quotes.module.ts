import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quote } from "./models/quote.model";
import { QuotesResolver } from "./quotes.resolver";
import { QuotesService } from "./quotes.service";

@Module({
    imports: [TypeOrmModule.forFeature([Quote])],
    providers: [QuotesResolver, QuotesService]
})
export class QuotesModule {}