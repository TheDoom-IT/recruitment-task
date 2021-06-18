import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { nameLength } from "src/quotes/models/quote.model";

//Validate string to avoid threats like SQL injection
@Injectable()
export class ValidateName implements PipeTransform{
    transform(value: string, metadata: ArgumentMetadata) {
        
        if(value.length > nameLength) {
            throw new HttpException('The name can\' be longer than 20 characters.', HttpStatus.BAD_REQUEST);
        }

        //TODO
        //Security issues???
        return value;
    }
}