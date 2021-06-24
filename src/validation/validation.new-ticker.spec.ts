import { ArgumentMetadata } from "@nestjs/common";
import { NewTickerInput } from "../tickers/dto/new-ticker.input";
import { ParseNewTicker } from "./validation.new-ticker";

describe('ParseNewTicker',() => {
    let target: ParseNewTicker;

    beforeEach(() => {
        target = new ParseNewTicker();
    });

    describe('transform', () => {
        describe('validation passes', () => {
            it('should return unchanged object', () => {
                const value = new NewTickerInput('name', 'fullName', 'description');
                expect(target.transform(value, {} as ArgumentMetadata)).toBe(value);
            });
        });

        describe('validation fails', () => {
            it('should throw an exception', () => {
                const value = new NewTickerInput('','fullName', 'description');
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new NewTickerInput('tooLongNameToUseAsName','fullName', 'description');
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new NewTickerInput('name','', 'description');
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                let str = '';
                for(let x = 0; x < 100; x++){
                    str+='a';
                }
                const value = new NewTickerInput('name',str, 'description');
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                const value = new NewTickerInput('name','fullName', '');
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

            it('should throw an exception', () => {
                let str = '';
                for(let x = 0; x < 250; x++){
                    str+='a';
                }
                const value = new NewTickerInput('name','fullName', str);
                expect(() => {target.transform(value, {} as ArgumentMetadata)})
                .toThrow();
            });

        });

    });
});