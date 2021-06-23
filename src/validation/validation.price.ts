import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { pricePrecision, priceScale } from "src/constants";

//Validate price if it is not negative etc.
@Injectable()
export class ValidatePrice implements PipeTransform {
    transform(value: number, metadata: ArgumentMetadata) {

        //price is numeric(10,2)
        if (value < 0 || value >= 10**(pricePrecision-priceScale) ) {
            throw new BadRequestException('The price can\'t be negative and greater or equal to 10^8.');
        }

        return value;
    }
}