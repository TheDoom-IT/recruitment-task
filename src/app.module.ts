import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { formatGQLError} from './graphql-error.format';
import { QuotesModule } from './quotes/quotes.module';
import { ConfigModule } from '@nestjs/config';
import { TickersModule } from './tickers/tickers.module';

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
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
