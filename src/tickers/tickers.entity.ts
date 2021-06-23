import { Column, Entity, PrimaryColumn } from "typeorm";
import { fullNameLength, descriptionLength, nameLength } from "../constants";

//entity to create database
@Entity('ticker')
export class TickerEntity {
    
    @PrimaryColumn({type: 'varchar', length: nameLength})
    name: string;

    @Column({type: 'varchar', length: fullNameLength})
    fullName: string;

    @Column({type: 'varchar', length: descriptionLength})
    description: string;
}