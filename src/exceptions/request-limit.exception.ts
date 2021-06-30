import { HttpException, HttpStatus } from "@nestjs/common"

export class RequestLimitException extends HttpException{
    constructor(){
        super('Database request limit reached',HttpStatus.INTERNAL_SERVER_ERROR);
    }
}