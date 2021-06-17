import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryColumn } from "typeorm";


@ObjectType()
@Entity()
export class Quote {

    constructor(name: string, timestamp: number, price?: number){
        this.name = name;
        this.timestamp = timestamp;
        this.price = price ?? 0;
    }
    
    @PrimaryColumn({type: 'varchar', length: 20})
    @Field()
    name: string;

    @PrimaryColumn({type: 'integer'})
    @Field(type => Int)
    timestamp: number;

    @Column({type: 'numeric', precision: 10, scale: 2})
    @Field(type => Float)
    price: number;
}