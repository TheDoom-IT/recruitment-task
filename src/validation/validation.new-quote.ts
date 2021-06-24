import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { NewQuoteInput } from "src/quotes/dto/new-quote.input";
import { parseName, parsePrice, parseTimestamp} from "./validation";

@Injectable()
export class ParseNewQuote implements PipeTransform{
    transform(value: NewQuoteInput, metadata: ArgumentMetadata) {

        parseName(value.name);

        parsePrice(value.price);

        parseTimestamp(value.timestamp);

        return value;
    }
}