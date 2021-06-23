import { Field, Float, InputType, Int } from "@nestjs/graphql";

@InputType()
export class NewQuoteInput {

    @Field()
    name: string;

    @Field(type => Int)
    timestamp: number;

    @Field(type => Float)
    price: number;
}