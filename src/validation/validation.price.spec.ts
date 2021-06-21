import { ArgumentMetadata} from "@nestjs/common";
import { pricePrecision, priceScale } from "../quotes/models/quote.model";
import { ValidatePrice } from "./validation.price";

describe('ValidatePrice',() => {
    let target: ValidatePrice;

    beforeEach(() => {
        target = new ValidatePrice();
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
                //too big value
                const value = 10**(pricePrecision-priceScale);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                //negative value
                const value = -100;
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });
            
            it('should throw an exception', () => {
                const value = 1234566345345;
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });
        });

    });
});