import { Injectable} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { FindTickerInput } from "./dto/find-ticker.input";
import { NewTickerInput } from "./dto/new-ticker.input";

@Injectable()
export class TickersService {
    constructor(private database: DatabaseService) { }

    async getTicker(toGet: FindTickerInput) {
        return this.database.getTicker(toGet);
    }

    async getTickers() {
        return this.database.getTickers();
    }

    async addTicker(newTicker: NewTickerInput) {
        return this.database.addTicker(newTicker).then(res => {
            return {...newTicker};
        });
    }

    async deleteTicker(toDelete: FindTickerInput) {
        return this.database.deleteTicker(toDelete);
    }

    async editTicker(toEdit: NewTickerInput) {
        return this.database.editTicker(toEdit).then(res => {
            return {...toEdit};
        });
    }
}