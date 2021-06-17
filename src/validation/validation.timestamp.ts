import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";

//Validate timestamp if it has proper value
@Injectable()
export class ValidateTimestamp implements PipeTransform {
    transform(value: number, metadata: ArgumentMetadata) {
        if (value < 0) {
            throw new HttpException('The timestamp can\'t be negative.'
                , HttpStatus.BAD_REQUEST);
        }
        if(value*1000 > Date.now()){
            throw new HttpException('The timestamp can\'t be in the future.'
                , HttpStatus.BAD_REQUEST);
        }
        return value;
    }
}