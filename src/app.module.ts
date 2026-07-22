import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TargetsModule } from './targets/targets.module';

@Module({
  imports: [CategoriesModule, PrismaModule, TransactionsModule, TargetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
