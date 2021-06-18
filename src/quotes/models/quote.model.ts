import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryColumn } from "typeorm";

export const nameLength = 20;
export const pricePrecision = 10;
export const priceScale = 2;

@ObjectType()
@Entity()
export class Quote {
    constructor(name: string, timestamp: number, price?: number){
        this.name = name;
        this.timestamp = timestamp;
        this.price = price ?? 0;
    }

    @PrimaryColumn({type: 'varchar', length: nameLength})
    @Field()
    name: string;

    @PrimaryColumn({type: 'integer'})
    @Field(type => Int)
    timestamp: number;

    @Column({type: 'numeric', precision: pricePrecision, scale: priceScale})
    @Field(type => Float)
    price: number;
}