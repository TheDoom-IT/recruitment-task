import { ArgumentMetadata } from "@nestjs/common";
import { NewQuoteInput } from "../quotes/dto/new-quote.input";
import { ParseNewQuote } from "./validation.new-quote";

describe('ParseNewQuote',() => {
    let target: ParseNewQuote;

    beforeEach(() => {
        target = new ParseNewQuote();
    });

    describe('transform', () => {
        describe('validation passes', () => {
            it('should return unchanged object', () => {
                const value = new NewQuoteInput('someName', 1,1);
                expect(target.transform(value, {} as ArgumentMetadata)).toBe(value);
            });
        });

        describe('validation fails', () => {
            it('should throw an exception', () => {
                const value = new NewQuoteInput('',1,1);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new NewQuoteInput('tooLongStringToUseAsName',1,1);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new NewQuoteInput('name',-1,1);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new NewQuoteInput('name',Date.now()/1000+1,1);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new NewQuoteInput('name',1,-1);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new NewQuoteInput('name',1,10**15);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });
        });

    });
});