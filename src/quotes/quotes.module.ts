import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { QuotesResolver } from "./quotes.resolver";
import { QuotesService } from "./quotes.service";

@Module({
    imports: [DatabaseModule],
    providers: [QuotesResolver, QuotesService]
})
export class QuotesModule {}