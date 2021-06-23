import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { nameLength } from "src/constants";


//Validate string to avoid threats like SQL injection
@Injectable()
export class ValidateName implements PipeTransform{
    transform(value: string, metadata: ArgumentMetadata) {
        
        if(value.length > nameLength) {
            throw new BadRequestException('The name can\' be longer than 20 characters.');
        }

        //TODO
        //Security issues???
        return value;
    }
}