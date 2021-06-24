import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

//GraphQL object type
@ObjectType()
export class Quote {

    constructor(name: string, timestamp: number, price: number){
        this.name = name;
        this.timestamp = timestamp;
        this.price = price;
    }
    @Field()
    name: string;

    @Field(type => Int)
    timestamp: number;

    @Field(type => Float)
    price: number;
}