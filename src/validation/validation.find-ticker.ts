import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { FindTickerInput } from "src/tickers/dto/find-ticker.input";
import { parseName } from "./validation";

@Injectable()
export class ParseFindTicker implements PipeTransform{
    transform(value: FindTickerInput, metadata: ArgumentMetadata) {
        
        parseName(value.name);

        return value;
    }
}