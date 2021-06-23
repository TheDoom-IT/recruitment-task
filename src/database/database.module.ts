import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService} from "@nestjs/config";
import { Quote } from "../quotes/models/quote.model";
import { Ticker } from "src/tickers/models/ticker.model";
import { DatabaseService } from "./database.service";


@Module({
    imports: [TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST'),
        port: config.get('POSTGRES_PORT'),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DB'),
        entities: [Quote, Ticker],
        synchronize: true,
      })
    }),
    TypeOrmModule.forFeature([Quote,Ticker])],
    providers: [DatabaseService],
    exports: [DatabaseService],
})
export class DatabaseModule {}