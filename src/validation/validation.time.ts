import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

//Check if the given time is in the proper format
//YYYY-MM-DD hh:mm
@Injectable()
export class ValidateTime implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata) {
        console.log(`Trying to validate time: ${value}`);
        return value;
    }
}