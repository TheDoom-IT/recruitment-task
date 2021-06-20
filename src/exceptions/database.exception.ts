import { HttpException, HttpStatus } from "@nestjs/common";

export class DatabaseException extends HttpException {
    constructor () {
        super('Database error',HttpStatus.INTERNAL_SERVER_ERROR);
    }
}