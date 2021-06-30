import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { formatGQLError} from './graphql-error.format';
import { QuotesModule } from './quotes/quotes.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TickersModule } from './tickers/tickers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteEntity } from './quotes/quotes.entity';
import { TickerEntity } from './tickers/tickers.entity';

@Module({
  imports: [
    QuotesModule,
    TickersModule,
    ConfigModule.forRoot({
      //use different config for tests
      envFilePath: process.env.NODE_ENV =='test' ? 'config/test.env':'config/.env',
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      //custom error(exception) formating
      formatError: formatGQLError,
    }),
    TypeOrmModule.forRootAsync({
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
  })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
