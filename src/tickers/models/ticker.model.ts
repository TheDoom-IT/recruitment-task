import { Field, ObjectType } from "@nestjs/graphql";

//GrapQL object type
@ObjectType()
export class Ticker {
    
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