import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class FindQuoteInput {

    @Field()
    name: string;

    @Field(type => Int)
    timestamp: number;
}