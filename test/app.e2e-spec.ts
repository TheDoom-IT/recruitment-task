import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import * as request from 'supertest'
import { Quote } from '../src/quotes/models/quote.model'

//simplify sending queries
function sendQuery(app: INestApplication, query: string) {
    return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: query });

}

async function emptyDatabase(app: INestApplication) {
    const toDelete = await sendQuery(app, 'query{getQuotes{name, timestamp}}')

    //clear the database to test
    await Promise.all(toDelete.body.data.getQuotes.map(async quote => {
        await sendQuery(app, `mutation{deleteQuote(name: "${quote.name}", timestamp: ${quote.timestamp}){name}}`);
    }))
}

async function insertTestingData(app: INestApplication) {
    return Promise.all([1, 2, 3].map(async x => {
        await sendQuery(app, `mutation{addQuote(name: "${x}", timestamp: ${x}, price: ${x}){name}}`);
    }));
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
    })

    beforeEach(() => {
        return emptyDatabase(app);
    })





    describe('getQuote', () => {
        //add some testing data
        beforeEach(() => {
            return insertTestingData(app);
        });

        it('should return one quote', () => {
            return sendQuery(app, `{getQuote(name: "${1}", timestamp: ${1}){name,timestamp,price}}`)
                .expect((res) => {
                    expect(res.body.data.getQuote).toEqual({
                        name: "1",
                        timestamp: 1,
                        price: 1
                    });
                });
        });

        it('should return an error', () => {
            return sendQuery(app, `{getQuote(name: "notInDatabase", timestamp: ${1}){name,timestamp,price}}`)
                .expect((res) => {
                    expect(res.body.errors[0].message).toBe('Value not found.');
                    expect(res.body.errors[0].extensions.status).toBe(HttpStatus.NOT_FOUND);
                });
        });
    })

    describe('getQuotes', () => {
        describe('filled database', () => {
            //add some testing data
            beforeEach(() => {
                return insertTestingData(app);
            });

            it('should return array of quotes', () => {
                return sendQuery(app, 'query{getQuotes{name, timestamp, price}}')
                    .expect((res) => {
                        expect(res.body.data.getQuotes).toEqual([
                            new Quote('1', 1, 1),
                            new Quote('2', 2, 2),
                            new Quote('3', 3, 3),
                        ]);
                    })
            })
        });

        describe('empty database', () => {
            it('should return empty array', () => {
                return sendQuery(app, 'query{getQuotes{name, timestamp, price}}')
                    .expect((res) => {
                        expect(res.body.data.getQuotes).toEqual([]);
                    })
            })
        })
    })

    describe('addQuote', () => {
        it('should add one quote', () => {
            return sendQuery(app, `mutation{addQuote(name: "${1}", timestamp: ${1}, price: ${1}){name}}`)
                .expect((res) => {
                    expect(res.body.data.addQuote).toEqual({
                        name: "1",
                    });
                });
        });

        it('should return an error', async () => {
            const query = `mutation{addQuote(name: "${1}", timestamp: ${1}, price: ${1}){name}}`;
            //add some quote
            await sendQuery(app, query);
            //tires to add it again
            return sendQuery(app, query)
                .expect((res) => {
                    expect(res.body.errors[0].message).toBe('The quote with the given name and timespamt already exists.');
                    expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                });
        })

    });

    describe('editQuote', () => {
        beforeEach(() => {
            return insertTestingData(app);
        });

        it('should return edited quote', async () => {
            await sendQuery(app, 'mutation{editQuote(name: "1", timestamp: 1, newPrice: 54321){name, timestamp, price}}')
                .expect(res => {
                    expect(res.body.data.editQuote).toEqual(new Quote('1', 1, 54321));
                });

            //check quote in the database if it is in edited form
            return sendQuery(app, '{getQuote(name: "1", timestamp: 1){name, timestamp, price}}')
                .expect(res => {
                    expect(res.body.data.getQuote).toEqual(new Quote('1', 1, 54321));
                });
        });

        it('should return an error', () => {
            return sendQuery(app, 'mutation{editQuote(name: "1", timestamp: 1, newPrice: -54321){name, timestamp, price}}')
                .expect(res => {
                    expect(res.body.errors[0].message).toBe('The price can\'t be negative and greater or equal to 10^8.');
                    expect(res.body.errors[0].extensions.status).toBe(HttpStatus.BAD_REQUEST);
                })
        })
    });

    describe('deleteQuote', () => {
        beforeEach(() => {
            return insertTestingData(app);
        });

        it('should return deleted quote', async () => {
            await sendQuery(app, 'mutation{deleteQuote(name: "3", timestamp: 3){name,timestamp,price}}')
                .expect(res => {
                    expect(res.body.data.deleteQuote).toEqual(new Quote("3", 3, 3));
                });

            //check if quote is not present in the database
            return sendQuery(app, '{getQuotes{name, timestamp, price}}')
                .expect(res => {
                    expect(res.body.data.getQuotes).toEqual([
                        new Quote('1', 1, 1),
                        new Quote('2', 2, 2)
                    ])
                })
        });

        it('should return an error', () => {
            return sendQuery(app, 'mutation{deleteQuote(name: "notInTheDB", timestamp: 3){name,timestamp,price}}')
                .expect(res => {
                    expect(res.body.errors[0].message).toBe('Value not found.');
                    expect(res.body.errors[0].extensions.status).toBe(HttpStatus.NOT_FOUND);
                })
        })
    });
});
