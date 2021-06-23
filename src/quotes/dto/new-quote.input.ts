import { Field, Float, InputType, Int } from "@nestjs/graphql";

@InputType()
export class NewQuoteInput {

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