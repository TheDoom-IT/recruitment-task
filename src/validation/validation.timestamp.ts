import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

//Validate timestamp if it has proper value
@Injectable()
export class ValidateTimestamp implements PipeTransform {
    transform(value: number, metadata: ArgumentMetadata) {
        if (value < 0) {
            throw new BadRequestException('The timestamp can\'t be negative.');
        }
        if(value*1000 > Date.now()){
            throw new BadRequestException('The timestamp can\'t be in the future.');
        }
        return value;
    }
}