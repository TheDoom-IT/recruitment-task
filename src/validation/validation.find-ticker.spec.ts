import { ArgumentMetadata } from "@nestjs/common";
import { FindTickerInput } from "../tickers/dto/find-ticker.input";
import { ParseFindTicker } from "./validation.find-ticker";

describe('ParseFindQuote',() => {
    let target: ParseFindTicker;

    beforeEach(() => {
        target = new ParseFindTicker();
    });

    describe('transform', () => {
        describe('validation passes', () => {
            it('should return unchanged object', () => {
                const value = new FindTickerInput('someName');
                expect(target.transform(value, {} as ArgumentMetadata)).toBe(value);
            });
        });
    });

        describe('validation fails', () => {
            it('should throw an exception', () => {
                const value = new FindTickerInput('');
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new FindTickerInput('tooLongStringThatIsNotValidForName');
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });
    });
});