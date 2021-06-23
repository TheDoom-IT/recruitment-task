import { Test, TestingModule } from "@nestjs/testing";
import { FindQuoteInput } from "./dto/find-quote.input";
import { NewQuoteInput } from "./dto/new-quote.input";
import { QuotesResolver } from "./quotes.resolver";
import { QuotesService } from "./quotes.service";


describe('QuotesResolver', () => {
    let quotesResolver: QuotesResolver;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [QuotesResolver,
                {
                    //custom provider
                    provide: QuotesService,
                    useFactory: () => ({
                        addQuote: jest.fn((newQuote: NewQuoteInput) => {
                            return { ...newQuote };
                        }),

                        getQuotes: jest.fn(() => {
                            return [
                                {
                                    name: '1',
                                    timestamp: 1,
                                    price: 1
                                },
                                {
                                    name: '2',
                                    timestamp: 2,
                                    price: 2
                                }
                            ]
                        }),

                        getQuote: jest.fn((toGet: FindQuoteInput) => {
                            return {
                                ...toGet,
                                price: 1
                            }
                        }),

                        deleteQuote: jest.fn((toDelete: FindQuoteInput) => {
                            return {
                                ...toDelete,
                                price: 1,
                            }
                        }),

                        editQuote: jest.fn((editQuote: NewQuoteInput) => {
                            return { ...editQuote };
                        }),
                    })
                }],
        }).compile();

        quotesResolver = module.get<QuotesResolver>(QuotesResolver);
    })

    it('should be defined', () => {
        expect(quotesResolver).toBeDefined();
    })

    describe('getQuote', () => {
        it('should return quote object', async () => {
            const name = 'someName';
            const time = 1234;
            const data = await quotesResolver.getQuote(new FindQuoteInput(name, time));
            expect(data).toEqual({
                name: name,
                timestamp: time,
                price: 1
            });
        });
    })

    describe('getQuotes', () => {
        it('should return array of quotes', async () => {
            const data = await quotesResolver.getQuotes();
            expect(data).toEqual([
                {
                    name: '1',
                    timestamp: 1,
                    price: 1
                },
                {
                    name: '2',
                    timestamp: 2,
                    price: 2
                }
            ]);
        })

    });

    describe('addQuote', () => {
        it('should return quote object', async () => {
            const name = 'someName';
            const time = 1234;
            const price = 1234;
            const data = await quotesResolver.addQuote(new NewQuoteInput(name, time, price));
            expect(data).toEqual({
                name: name,
                timestamp: time,
                price: price
            });
        });
    });

    describe('editQuote', () => {
        it('should return quote object', async () => {
            const name = 'someName';
            const time = 1234;
            const price = 1234;
            const data = await quotesResolver.editQuote(new NewQuoteInput(name,time,price));
            expect(data).toEqual({
                name: name,
                timestamp: time,
                price: price,
            });
        });
    });

    describe('deleteQuote', () => {
        it('should return quote object', async () => {
            const name = 'someName';
            const time = 1234;
            const data = await quotesResolver.deleteQuote(new FindQuoteInput(name,time));
            expect(data).toEqual({
                name: name,
                timestamp: time,
                price: 1,
            });
        });
    });
});