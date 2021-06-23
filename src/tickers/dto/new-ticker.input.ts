import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class NewTickerInput {

    @Field()
    name: string;

    @Field()
    fullName: string;

    @Field()
    description: string;
}