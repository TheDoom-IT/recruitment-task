import { ArgumentMetadata } from "@nestjs/common";
import { FindQuoteInput } from "../quotes/dto/find-quote.input";
import { ParseFindQuote } from "./validation.find-quote";

describe('ParseFindQuote',() => {
    let target: ParseFindQuote;

    beforeEach(() => {
        target = new ParseFindQuote();
    });

    describe('transform', () => {
        describe('validation passes', () => {
            it('should return unchanged object', () => {
                const value = new FindQuoteInput('someName', 1);
                expect(target.transform(value, {} as ArgumentMetadata)).toBe(value);
            });
        });
    });

        describe('validation fails', () => {
            it('should throw an exception', () => {
                const value = new FindQuoteInput('',1);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new FindQuoteInput('tooLongStringToUseAsName',1);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new FindQuoteInput('name',-1);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new FindQuoteInput('name',Date.now()/1000+1);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

    });
});