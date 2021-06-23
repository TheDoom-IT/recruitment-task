import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class FindQuoteInput {

    constructor(name: string, timestamp: number){
        this.name = name;
        this.timestamp = timestamp;
    }
    
    @Field()
    name: string;

    @Field(type => Int)
    timestamp: number;
}