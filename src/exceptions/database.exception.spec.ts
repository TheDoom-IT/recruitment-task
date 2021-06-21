import { HttpStatus } from "@nestjs/common";
import { DatabaseException } from "./database.exception"


describe('DatabaseException', () => {
    it('should return "Database error" exception', () => {
        let target = new DatabaseException();

        expect(target.getResponse()).toBe('Database error');
        expect(target.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    })
})