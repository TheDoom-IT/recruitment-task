import { HttpException, HttpStatus } from "@nestjs/common"

export class ValueNotFoundException extends HttpException{
    constructor(){
        super('Value not found',HttpStatus.NOT_FOUND);
    }
}