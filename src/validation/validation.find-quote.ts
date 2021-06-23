import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { FindQuoteInput } from "src/quotes/dto/find-quote.input";
import { parseName, parseTimestamp } from "./validation";

@Injectable()
export class ParseFindQuote implements PipeTransform{
    transform(value: FindQuoteInput, metadata: ArgumentMetadata) {
        
        parseName(value.name);

        parseTimestamp(value.timestamp);

        return value;
    }
}