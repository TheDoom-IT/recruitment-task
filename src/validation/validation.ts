import { BadRequestException } from "@nestjs/common";
import { descriptionLength, fullNameLength, nameLength, pricePrecision, priceScale } from "src/constants";

export function validateString(value: string, length: number): boolean {

    if(value.length > length || value.length < 1) {
        return false;
    }

    //TODO
    //Security issues???
    return true;
}

//check if number is positive and does not exceed maxValue
export function validateNumber(value: number, maxValue: number): boolean {

    if (value < 0 || value >= maxValue ) {
        return false;
    }

    return true;
}

////////////////////////////////////////
//functions to parse fields of Quote and Ticker
////////////////////////////////////////

export function parseTimestamp(value: number) {

    if(value < 0 || value*1000 > Date.now()){
        throw new BadRequestException('The field "timestamp" has unproper value. It can\'t be negative or in the future.');
    }
}

export function parseName(value: string){
    if(!validateString(value,nameLength)){
        throw new BadRequestException('The field "name" has unproper value. The length should be between 1 and 20.');
    }
}

export function parsePrice(value: number){
    if(!validateNumber(value,10**(pricePrecision - priceScale))){
        throw new BadRequestException('The field "price" has unproper value. It can\'t be negative and greater or equal to 10^8.');
    }
}

export function parseFullName(value: string){
    if(!validateString(value,fullNameLength)){
        throw new BadRequestException('The field "fullName" has unproper value. The length should be between 1 and 50.')
    }
}

export function parseDescription(value: string){
    if(!validateString(value, descriptionLength)){
        throw new BadRequestException('The field "description" has unproper value. The length should be between 1 and 200.')
    }
}
