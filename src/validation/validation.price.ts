import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { pricePrecision, priceScale } from "src/quotes/models/quote.model";

//Validate price if it is not negative etc.
@Injectable()
export class ValidatePrice implements PipeTransform {
    transform(value: number, metadata: ArgumentMetadata) {

        if (value < 0 || value >= 10**(pricePrecision-priceScale) ) {
            throw new HttpException('The price can\'t be negative and greater or equal to 10^8.'
                , HttpStatus.BAD_REQUEST);
        }

        //price is numeric(10,2)
        return value;
    }
}