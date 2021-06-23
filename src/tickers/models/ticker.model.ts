import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { fullNameLength, descriptionLength, nameLength } from "src/constants";

//GrapQL object type
//entity to create database
@ObjectType()
@Entity()
export class Ticker {

    @PrimaryColumn({type: 'varchar', length: nameLength})
    @Field()
    name: string;

    @Column({type: 'varchar', length: fullNameLength})
    @Field()
    fullName: string;

    @Column({type: 'varchar', length: descriptionLength})
    @Field()
    description: string;
}