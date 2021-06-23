import { TickerEntity } from "../tickers/tickers.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { nameLength, pricePrecision, priceScale, } from "../constants";

//Entity to create database
@Entity('quote')
export class QuoteEntity {

    @Column({type: 'varchar', length: nameLength, primary: true})
    name: string;

    @Column({type: 'integer', primary: true})
    timestamp: number;

    @Column({type: 'numeric', precision: pricePrecision, scale: priceScale})
    price: number;

    //relation between quote and ticker
    @ManyToOne(() => TickerEntity, ticker => ticker.name)
    @JoinColumn({name: 'name'})
    nameTicker: string;
}