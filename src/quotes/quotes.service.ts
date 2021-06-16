import { Injectable } from "@nestjs/common";
import { Quote } from "./models/quote.model";

@Injectable()
export class QuotesService{
    
    addQuote(name: string, time: string, price: number): Quote {
        console.log(`Trying to add ${name}`);
        return new Quote(name,time,price);
    }

    getQuote(name: string, time: string): Quote {
        console.log(`Trying to get ${name}`);
        return new Quote(name,time);
    }
}