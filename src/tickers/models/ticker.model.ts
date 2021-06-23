import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { fullNameLength, descriptionLength, nameLength } from "../../constants";

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