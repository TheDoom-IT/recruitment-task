import { Field, Float, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryColumn } from "typeorm";


@ObjectType()
@Entity()
export class Quote {

    constructor(name: string, time: string, price?: number){
        this.name = name;
        this.time = time;
        this.price = price ?? 0;
    }
    
    @PrimaryColumn()
    @Field()
    name: string;

    @PrimaryColumn()
    @Field()
    time: string;

    @Column()
    @Field(type => Float)
    price: number;
}