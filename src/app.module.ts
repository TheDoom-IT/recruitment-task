import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Connection } from 'typeorm';
import { formatGQLError} from './graphql-error.format';
import { Quote } from './quotes/models/quote.model';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    QuotesModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      //custom error(exception) formating
      formatError: formatGQLError,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'stock',
      entities: [Quote],
      synchronize: true,
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
