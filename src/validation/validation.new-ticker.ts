import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { NewTickerInput } from "src/tickers/dto/new-ticker.input";
import { parseDescription, parseFullName, parseName, parsePrice, parseTimestamp} from "./validation";

@Injectable()
export class ParseNewTicker implements PipeTransform{
    transform(value: NewTickerInput, metadata: ArgumentMetadata) {
        
        parseName(value.name);

        parseFullName(value.fullName);

        parseDescription(value.description);

        return value;
    }
}