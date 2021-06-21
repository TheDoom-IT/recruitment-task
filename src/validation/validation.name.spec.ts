import { ValidateName } from "./validation.name";
import { ArgumentMetadata } from "@nestjs/common";

describe('ValidateName',() => {
    let target: ValidateName;

    beforeEach(() => {
        target = new ValidateName();
    });

    describe('transform', () => {
        describe('validation passes', () => {
            it('should return unchanged string', () => {
                const value = 'test';
                expect(target.transform(value, {} as ArgumentMetadata)).toBe(value);
            });
        });

        describe('validation fails', () => {
            it('should throw an exception', () => {
                const value = 'tooLongStringWhichThrowsAnException';
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });
        });

    });
});