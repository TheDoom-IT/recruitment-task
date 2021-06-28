import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { FindTickerInput } from "./dto/find-ticker.input";
import { NewTickerInput } from "./dto/new-ticker.input";

@Injectable()
export class TickersService {
    constructor(private database: DatabaseService) { }

    async getTicker(toGet: FindTickerInput) {
        return this.database.findTicker(toGet)
            .then(res => {
                if (res === undefined) {
                    throw new NotFoundException('Value not found.');
                }
                return res;
            });
    }

    async getTickers() {
        return this.database.findTickers();
    }

    async addTicker(newTicker: NewTickerInput) {
        if(await this.database.tryAddTicker(newTicker) === false){
            throw new BadRequestException('The ticker with the given name already exists.');
        }

        return {...newTicker};
    }

    async deleteTicker(toDelete: FindTickerInput) {
        //check if such a ticker exists in database
        //if not findTicker throws an exception
        const quoteToDelete = await this.getTicker(toDelete);

        //check if such a ticker is used by some quote
        if (await this.database.isTickerInUse(toDelete)) {
            throw new BadRequestException('The ticker is already used by some quotes. Try to delete quotes at first. ');
        }

        return this.database.deleteTicker(toDelete)
            .then(res => {
                return quoteToDelete;
            });
    }

    async editTicker(toEdit: NewTickerInput) {
        //check if such a ticker exists
        await this.getTicker({name: toEdit.name});

        return this.database.editTicker(toEdit)
            .then(res => {
                return { ...toEdit };
            })
    }
}