import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class NewTickerInput {

    constructor(name: string, fullName: string, description: string){
        this.name = name;
        this.fullName = fullName;
        this.description = description;
    }
    
    @Field()
    name: string;

    @Field()
    fullName: string;

    @Field()
    description: string;
}