import { ArgumentMetadata } from "@nestjs/common";
import { ValidateTimestamp } from "./validation.timestamp";

describe('ValidateTimestamp',() => {
    let target: ValidateTimestamp;

    beforeEach(() => {
        target = new ValidateTimestamp();
    });

    describe('transform', () => {
        describe('validation passes', () => {
            it('should return unchanged number', () => {
                const value = 1234;
                expect(target.transform(value, {} as ArgumentMetadata)).toBe(value);
            });
        });

        describe('validation fails', () => {
            it('should throw an exception', () => {
                //negative value
                const value = -1234;
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });
            
            it('should throw an exception', () => {
                //future timestamp
                const value = Date.now()/1000 + 1;
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });
        });

    });
});