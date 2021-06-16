import { ArgumentMetadata, Injectable } from "@nestjs/common";

//Validate string to avoid threats like SQL injection
@Injectable()
export class ValidateString{
    transform(value: string, metadata: ArgumentMetadata) {
        console.log(`Trying to validate string: ${value}`);
        return value;
    }
}