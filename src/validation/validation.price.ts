import { ArgumentMetadata, Injectable } from "@nestjs/common";

//Validate price if it is not negative etc.
@Injectable()
export class ValidatePrice {
    transform(value: number, metadata: ArgumentMetadata) {
        console.log(`Trying to validate price: ${value}`);
        return value;
    }
}