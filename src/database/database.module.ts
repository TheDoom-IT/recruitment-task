import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService} from "@nestjs/config";
import { DatabaseService } from "./database.service";
import { QuoteEntity } from "../quotes/quotes.entity";
import { TickerEntity } from "../tickers/tickers.entity";


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
        entities: [QuoteEntity, TickerEntity],
        synchronize: true,
      })
    }),
    TypeOrmModule.forFeature([QuoteEntity,TickerEntity])],
    providers: [DatabaseService],
    exports: [DatabaseService],
})
export class DatabaseModule {}