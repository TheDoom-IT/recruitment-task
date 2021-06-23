import { Field, InputType } from "@nestjs/graphql";


@InputType()
export class FindTickerInput {

    @Field()
    name: string;
}