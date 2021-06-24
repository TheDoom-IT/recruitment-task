import { Test, TestingModule } from "@nestjs/testing";
import { NewTickerInput } from "../tickers/dto/new-ticker.input";
import { FindTickerInput } from "./dto/find-ticker.input";
import { TickersResolver } from "./tickers.resolver";
import { TickersService } from "./tickers.service";


describe('TickersResolver', () => {
    let tickersResolver: TickersResolver;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TickersResolver,
                {
                    //custom provider
                    provide: TickersService,
                    useFactory: () => ({

                        addTicker: jest.fn((newTicker: NewTickerInput) => {
                            return { ...newTicker };
                        }),

                        getTickers: jest.fn(() => {
                            return [
                                {
                                    name: '1',
                                    fullName: '1',
                                    description: '1'
                                },
                                {
                                    name: '2',
                                    fullName: '2',
                                    description: '2'
                                }
                            ]
                        }),

                        getTicker: jest.fn((toGet: FindTickerInput) => {
                            return {
                                ...toGet,
                                fullName: '1',
                                description: '1'
                            }
                        }),

                        deleteTicker: jest.fn((toDelete: FindTickerInput) => {
                            return {
                                ...toDelete,
                                fullName: '1',
                                description: '1',
                            }
                        }),

                        editTicker: jest.fn((toEdit: NewTickerInput) => {
                            return { ...toEdit };
                        }),
                    })
                }],
        }).compile();

        tickersResolver = module.get<TickersResolver>(TickersResolver);
    })

    it('should be defined', () => {
        expect(tickersResolver).toBeDefined();
    })

    describe('getTicker', () => {
        it('should return ticker object', async () => {
            const name = 'someName';
            const data = await tickersResolver.getTicker(new FindTickerInput(name));
            expect(data).toEqual({
                name: name,
                fullName: '1',
                description: '1'
            });
        });
    })

    describe('getTickers', () => {
        it('should return array of tickers', async () => {
            const data = await tickersResolver.getTickers();
            expect(data).toEqual([
                {
                    name: '1',
                    fullName: '1',
                    description: '1'
                },
                {
                    name: '2',
                    fullName: '2',
                    description: '2'
                }
            ]);
        })

    });

    describe('addTicker', () => {
        it('should return ticker object', async () => {
            const name = 'someName';
            const fullName = 'fullName';
            const description = 'dsc';
            const data = await tickersResolver.addTicker(new NewTickerInput(name,fullName,description));
            expect(data).toEqual({
                name: name,
                fullName: fullName,
                description: description,
            });
        });
    });

    describe('editTicker', () => {
        it('should return ticker object', async () => {
            const name = 'someName';
            const fullName = 'fullName';
            const description = 'dsc';
            const data = await tickersResolver.editTicker(new NewTickerInput(name,fullName, description));
            expect(data).toEqual({
                name: name,
                fullName: fullName,
                description: description
            });
        });
    });

    describe('deleteTicker', () => {
        it('should return ticker object', async () => {
            const name = 'someName';
            const data = await tickersResolver.deleteTicker(new FindTickerInput(name));
            expect(data).toEqual({
                name: name,
                fullName: '1',
                description: '1'
            });
        });
    });

});