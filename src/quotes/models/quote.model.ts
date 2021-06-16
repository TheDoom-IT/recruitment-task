import { Field, Float, ObjectType } from "@nestjs/graphql";


@ObjectType()
export class Quote {

    constructor(name: string, time: string, price?: number){
        this.name = name;
        this.time = time;
        this.price = price ?? 0;
    }
    
    @Field()
    name: string;

    @Field()
    time: string;

    @Field(type => Float)
    price: number;
}