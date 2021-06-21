import { Test, TestingModule } from "@nestjs/testing";
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
                        addQuote: jest.fn((name: string, timestamp: number, price: number) => {
                            return {
                                name: name,
                                timestamp: timestamp,
                                price: price,
                            }
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

                        getQuote: jest.fn((name: string, timestamp: number) => {
                            return {
                                name: name,
                                timestamp: timestamp,
                                price: 1
                            }
                        })
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
            const data = await quotesResolver.getQuote(name, time);
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
        it('should return quote object', async() => {
            const name = 'someName';
            const time = 1234;
            const price = 1234;
            const data = await quotesResolver.addQuote(name, time, price);
            expect(data).toEqual({
                name: name,
                timestamp: time,
                price: price
            })
        })

    })
});