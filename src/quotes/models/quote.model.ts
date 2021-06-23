import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { nameLength, pricePrecision, priceScale, } from "../../constants";
import { Ticker } from "../../tickers/models/ticker.model";

//GraphQL object type
//Entity to create database
@ObjectType()
@Entity()
export class Quote {

    @Column({type: 'varchar', length: nameLength, primary: true})
    @Field()
    name: string;

    @Column({type: 'integer', primary: true})
    @Field(type => Int)
    timestamp: number;

    @Column({type: 'numeric', precision: pricePrecision, scale: priceScale})
    @Field(type => Float)
    price: number;

    //relation between quote and ticker
    @ManyToOne(() => Ticker, ticker => ticker.name)
    @JoinColumn({name: 'name'})
    nameTicker: string;
}