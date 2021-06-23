import { Field, InputType } from "@nestjs/graphql";


@InputType()
export class FindTickerInput {

    constructor(name: string) {
        this.name = name;
    }
    
    @Field()
    name: string;
}