import { HttpStatus } from "@nestjs/common";
import { RequestLimitException } from "./request-limit.exception";


describe('RequestLimitException', () => {
    it('should return an exception', () => {
        let target = new RequestLimitException();

        expect(target.getResponse()).toBe('Database request limit reached');
        expect(target.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    })
})