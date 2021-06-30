import { HttpStatus } from "@nestjs/common";
import { ValueNotFoundException } from "./value-not-found.exception";


describe('ValueNotFoundException', () => {
    it('should return an exception', () => {
        let target = new ValueNotFoundException();

        expect(target.getResponse()).toBe('Value not found');
        expect(target.getStatus()).toBe(HttpStatus.NOT_FOUND);
    })
})