import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";

//Validate price if it is not negative etc.
@Injectable()
export class ValidatePrice implements PipeTransform {
    transform(value: number, metadata: ArgumentMetadata) {

        if (value < 0 || value >= 10**8) {
            throw new HttpException('The price can\'t be negative or greater or equal to 10^8.'
                , HttpStatus.BAD_REQUEST);
        }

        //price is numeric(10,2)
        return value;
    }
}