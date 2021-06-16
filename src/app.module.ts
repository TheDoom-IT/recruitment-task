import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Quote } from './quotes/models/quote.model';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    QuotesModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
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
