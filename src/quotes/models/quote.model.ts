import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

//GraphQL object type
@ObjectType()
export class Quote {

    @Field()
    name: string;

    @Field(type => Int)
    timestamp: number;

    @Field(type => Float)
    price: number;
}