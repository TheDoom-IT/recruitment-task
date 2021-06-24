import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import * as request from 'supertest'
import { Quote } from '../src/quotes/models/quote.model'
import { Ticker } from '../src/tickers/models/ticker.model'

//simplify sending queries
function sendQuery(app: INestApplication, query: string) {
    return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: query });

}

async function emptyDatabase(app: INestApplication) {
    const quotesToDelete = await sendQuery(app, 'query{getQuotes{name, timestamp}}')

    //delete quotes from database
    await Promise.all(quotesToDelete.body.data.getQuotes.map(async quote => {
        await sendQuery(app, `mutation{deleteQuote(delete: {name: "${quote.name}", timestamp: ${quote.timestamp}}){name}}`);
    }))

    const tickersToDelete = await sendQuery(app, 'query{getTickers{name}}');

    //delete tickers from database
    await Promise.all(tickersToDelete.body.data.getTickers.map(async ticker => {
        await sendQuery(app, `mutation{deleteTicker(delete: {name: "${ticker.name}"}){name}}`);
    }))
}

async function insertTestingData(app: INestApplication) {
    for (const x of [1, 2, 3]) {
        await sendQuery(app, `mutation{addTicker(new: {name: "${x}", fullName: "${x}", description: "${x}"}){name}}`);
        await sendQuery(app, `mutation{addQuote(new: {name: "${x}", timestamp: ${x}, price: ${x}}){name}}`);
    }
}

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    })

    afterAll(async () => {
        await app.close();
    });

    


    describe('Quote', () => {
        beforeEach(async () => {
            await emptyDatabase(app);
            return await insertTestingData(app);
    
        });

        describe('getQuote', () => {
            it('should return one quote', () => {
                return sendQuery(app, '{getQuote(get: {name: "1", timestamp: 1}){name,timestamp,price}}')
                    .expect((res) => {
                        expect(res.body.data.getQuote).toEqual(
                            new Quote('1', 1, 1),
                        );
                    });
            });

            it('should return one quote', () => {
                return sendQuery(app, '{getQuote(get: {name: "2", timestamp: 2}){name,timestamp,price}}')
                    .expect((res) => {
                        expect(res.body.data.getQuote).toEqual(
                            new Quote('2', 2, 2),
                        );
                    });
            });

            it('should return an error', () => {
                return sendQuery(app, '{getQuote(get: {name: "notInDatabase", timestamp: 1}){name,timestamp,price}}')
                    .expect((res) => {
                        expect(res.body.errors[0].message).toBe('Value not found.');
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.NOT_FOUND);
                    });
            });

            //wrong name
            it('should return an error', () => {
                return sendQuery(app, '{getQuote(get: {name: "", timestamp: 1}){name,timestamp,price}}')
                    .expect((res) => {
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                    });
            });

            //wrong timestamp
            it('should return an error', () => {
                return sendQuery(app, '{getQuote(get: {name: "1", timestamp: -5}){name,timestamp,price}}')
                    .expect((res) => {
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                    });
            });
        });




        describe('getQuotes', () => {
            describe('filled database', () => {
                it('should return array of quotes', () => {
                    return sendQuery(app, 'query{getQuotes{name, timestamp, price}}')
                        .expect((res) => {
                            expect(res.body.data.getQuotes).toEqual([
                                { ...new Quote('1', 1, 1) },
                                { ...new Quote('2', 2, 2) },
                                { ...new Quote('3', 3, 3) },
                            ]);
                        });
                });
            });

            describe('empty database', () => {
                it('should return empty array', async () => {
                    await emptyDatabase(app);

                    return await sendQuery(app, 'query{getQuotes{name, timestamp, price}}')
                        .expect((res) => {
                            expect(res.body.data.getQuotes).toEqual([]);
                        });

                });
            });



            describe('addQuote', () => {
                it('should return added quote', () => {
                    return sendQuery(app, 'mutation{addQuote(new: {name: "1", timestamp: 2, price: 4}){name, timestamp}}')
                        .expect((res) => {
                            expect(res.body.data.addQuote).toEqual({
                                name: "1",
                                timestamp: 2
                            });
                        });
                });

                //quote already exists
                it('should return an error', () => {
                    return sendQuery(app, 'mutation{addQuote(new: {name: "1", timestamp: 1, price: 1}){name}}')
                        .expect((res) => {
                            expect(res.body.errors[0].message).toBe('The quote with the given name and timespamt already exists.');
                            expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                        });
                });

                //there is no ticker with the given name
                it('should return an error', () => {
                    return sendQuery(app, 'mutation{addQuote(new: {name: "4", timestamp: 1, price: 1}){name}}')
                        .expect((res) => {
                            expect(res.body.errors[0].message).toBe('The ticker of the given name is not served by the API. Try to add a ticker first.');
                            expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                        });
                });

                //wrong name
                it('should return an error', () => {
                    return sendQuery(app, 'mutation{addQuote(new: {name: "tooLongStringToUseAsAName", timestamp: 1, price: 1}){name}}')
                        .expect((res) => {
                            expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                        });
                });

                //wrong timestamp
                it('should return an error', () => {
                    return sendQuery(app, `mutation{addQuote(new: {name: "1", timestamp: ${Math.floor(Date.now() / 1000 + 10)}, price: 1}){name}}`)
                        .expect((res) => {
                            expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                        });
                });

                //wrong price
                it('should return an error', () => {
                    return sendQuery(app, 'mutation{addQuote(new: {name: "1", timestamp: 1, price: -1}){name}}')
                        .expect((res) => {
                            expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                        });
                });

            });


            describe('editQuote', () => {
                it('should return edited quote', async () => {
                    await sendQuery(app, 'mutation{editQuote(edit: {name: "1", timestamp: 1, price: 54321}){name, timestamp, price}}')
                        .expect(res => {
                            expect(res.body.data.editQuote).toEqual(new Quote('1', 1, 54321));
                        });

                    //check if quote is in edited form in database
                    return await sendQuery(app, '{getQuote(get: {name: "1", timestamp: 1}){name, timestamp, price}}')
                        .expect(res => {
                            expect(res.body.data.getQuote).toEqual(new Quote('1', 1, 54321));
                        });
                });

                //wrong price
                it('should return an error', () => {
                    return sendQuery(app, 'mutation{editQuote(edit: {name: "1", timestamp: 1, price: -54321}){name, timestamp, price}}')
                        .expect(res => {
                            expect(res.body.errors[0].message).toBe('The field "price" has unproper value. It can\'t be negative and greater or equal to 10^8.');
                            expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                        })
                })
            });




            describe('deleteQuote', () => {
                it('should return deleted quote', async () => {
                    await sendQuery(app, 'mutation{deleteQuote(delete: {name: "3", timestamp: 3}){name,timestamp,price}}')
                        .expect(res => {
                            expect(res.body.data.deleteQuote).toEqual(new Quote("3", 3, 3));
                        });

                    //check if deleted quote is not present in the database
                    return sendQuery(app, '{getQuotes{name, timestamp, price}}')
                        .expect(res => {
                            expect(res.body.data.getQuotes).toEqual([
                                new Quote('1', 1, 1),
                                new Quote('2', 2, 2)
                            ])
                        })
                });

                //quote does not exists
                it('should return an error', () => {
                    return sendQuery(app, 'mutation{deleteQuote(delete: {name: "notInTheDB", timestamp: 3}){name,timestamp,price}}')
                        .expect(res => {
                            expect(res.body.errors[0].message).toBe('Value not found.');
                            expect(res.body.errors[0].extensions.status).toBe(HttpStatus.NOT_FOUND);
                        })
                })

                //wrong timestamp
                it('should return an error', () => {
                    return sendQuery(app, 'mutation{deleteQuote(delete: {name: "1", timestamp: -3}){name,timestamp,price}}')
                        .expect(res => {
                            expect(res.body.errors[0].message).toBe('The field "timestamp" has unproper value. It can\'t be negative or in the future.');
                            expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                        })
                })
            });
        });

    });

    describe('Ticker', () => {
        beforeEach(async () => {
            await emptyDatabase(app);
            return await insertTestingData(app);
    
        });

        describe('getTicker', () => {
            it('should return one ticker', () => {
                return sendQuery(app, '{getTicker(get: {name: "2"}){fullName, description}}')
                    .expect(res => {
                        expect(res.body.data.getTicker).toEqual({
                            fullName: '2',
                            description: '2'
                        })
                    })
            });

            it('should return an error', () => {
                return sendQuery(app, '{getTicker(get: {name: "noInDB"}){fullName, description}}')
                    .expect(res => {
                        expect(res.body.errors[0].message).toBe('Value not found.');
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.NOT_FOUND);

                    })
            });

            //wrong name
            it('should return an error', () => {
                return sendQuery(app, '{getTicker(get: {name: ""}){fullName, description}}')
                    .expect(res => {
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                    })
            });
        });


        describe('getTickers', () => {
            describe('filled database', () => {
                it('should return array of tickers', () => {
                    return sendQuery(app, '{getTickers{name, fullName, description}}')
                        .expect(res => {
                            expect(res.body.data.getTickers).toEqual([
                                { ...new Ticker('1', '1', '1') },
                                { ...new Ticker('2', '2', '2') },
                                { ...new Ticker('3', '3', '3') }
                            ]);
                        });
                });
            });

            describe('empty database', () => {
                it('should return empty array', async () => {
                    await emptyDatabase(app);

                    return await sendQuery(app, '{getTickers{name, fullName, description}}')
                        .expect(res => {
                            expect(res.body.data.getTickers).toEqual([]);
                        });
                });
            });
        });

        describe('addTicker', () => {
            it('should return added ticker', () => {
                return sendQuery(app, 'mutation{addTicker(new: {name: "4", fullName: "4", description: "4"}){name, fullName, description}}')
                    .expect(res => {
                        expect(res.body.data.addTicker).toEqual(new Ticker('4','4','4'));
                    })
            });

            //ticker already exists
            it('should return an error', () => {
                return sendQuery(app, 'mutation{addTicker(new: {name: "3", fullName: "4", description: "4"}){name, fullName, description}}')
                    .expect(res => {
                        expect(res.body.errors[0].message).toBe('The ticker with the given name already exists.');
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                    });
            });

            //wrong name
            it('should return an error', () => {
                return sendQuery(app, 'mutation{addTicker(new: {name: "", fullName: "4", description: "4"}){name, fullName, description}}')
                    .expect(res => {
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                    });
            });

            //wrong fullName
            it('should return an error', () => {
                return sendQuery(app, 'mutation{addTicker(new: {name: "4", fullName: "", description: "4"}){name, fullName, description}}')
                    .expect(res => {
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                    });
            });

            //wrong description
            it('should return an error', () => {
                return sendQuery(app, 'mutation{addTicker(new: {name: "4", fullName: "4", description: ""}){name, fullName, description}}')
                    .expect(res => {
                        expect(res.body.errors[0].message).toBe('The field "description" has unproper value. The length should be between 1 and 200.');
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                    });
            });
        });


        describe('deleteTicker', () => {
            it('should return deleted ticker', async () => {
                //delete quote related with ticker
                await sendQuery(app, 'mutation{deleteQuote(delete: {name: "1", timestamp: 1}){name}}');

                //try to delete ticker
                await sendQuery(app, 'mutation{deleteTicker(delete: {name: "1"}){name, fullName, description}}')
                    .expect(res => {
                        expect(res.body.data.deleteTicker).toEqual(new Ticker('1','1','1'));
                    });

                //database shouldn't have such a ticker
                return await sendQuery(app, '{getTickers{name}}')
                    .expect(res => {
                        expect(res.body.data.getTickers).toEqual([
                            {name: '2'},
                            {name: '3'}
                        ])
                    })
            });

            //ticker is used by some quote
            it('should return an error', () => {
                return sendQuery(app, 'mutation{deleteTicker(delete: {name: "1"}){name}}')
                    .expect(res => {
                        expect(res.body.errors[0].message).toBe('The ticker is already used by some quotes. Try to delete quotes at first. ');
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                    });
            });

            //ticker does not exist
            it('should return an error', () => {
                return sendQuery(app, 'mutation{deleteTicker(delete: {name: "notInDB"}){name}}')
                    .expect(res => {
                        expect(res.body.errors[0].message).toBe('Value not found.');
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.NOT_FOUND);
                    });
            });

            //wrong name
            it('should return an error', () => {
                return sendQuery(app, 'mutation{deleteTicker(delete: {name: ""}){name}}')
                    .expect(res => {
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                    });
            });
        });

        describe('editTicker', () => {
            it('should return edited ticker', async () => {
                //try to edit
                await sendQuery(app, 'mutation{editTicker(edit: {name: "1", fullName: "one", description: "It is one"}){name, fullName, description}}')
                    .expect(res => {
                        expect(res.body.data.editTicker).toEqual(new Ticker('1','one','It is one'));
                    });

                //database should have modified ticker
                return await sendQuery(app, '{getTicker(get: {name: "1"}){name, fullName, description}}')
                    .expect(res => {
                        expect(res.body.data.getTicker).toEqual(new Ticker('1','one','It is one'));
                    })
            });

            //ticker does not exist
            it('should return an error', () => {
                return sendQuery(app, 'mutation{editTicker(edit: {name: "notInDB", fullName: "one", description: "It is one"}){name, fullName, description}}')
                    .expect(res => {
                        expect(res.body.errors[0].message).toBe('Value not found.');
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.NOT_FOUND);
                    });
            });

            //wrong name
            it('should return an error', () => {
                return sendQuery(app, 'mutation{editTicker(edit: {name: "", fullName: "one", description: "It is one"}){name, fullName, description}}')
                    .expect(res => {
                        expect(res.body.errors[0].message).toBe('The field "name" has unproper value. The length should be between 1 and 20.');
                        expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                    });
            });
        });
    });


    describe('Concurrent processing', () => {
        it('should add 100 tickers to the database', async () => {
            //clear database
            await emptyDatabase(app);

            let toAdd: string[] = [];
            for(let x =1;x <= 100; x++){
                toAdd.push(`${x}`);
            }

            //add 100 tickers concurrently
            await Promise.all(toAdd.map(async x => {
                await sendQuery(app, `mutation{addTicker(new: {name: "${x}", fullName: "${x}", description: "${x}"}){name}}`);
            }));

            //check if there is 100 tickers in DB
            await sendQuery(app, `{getTickers{name}}`)
                .expect(res => {
                    expect(res.body.data.getTickers.length === 100);
                });
            
            //check if every ticker was added to DB
            for (const x of toAdd){
                await sendQuery(app, `{getTicker(get: {name: "${x}"}){name, fullName, description}}`)
                    .expect(res => {
                        expect(res.body.data.getTicker).toEqual(new Ticker(x,x,x));
                    });
            }
        });
        
    });
});
