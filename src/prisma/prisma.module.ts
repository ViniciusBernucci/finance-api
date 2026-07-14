import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 essencial: sem isso, outros módulos não conseguem injetar o PrismaService
})
export class PrismaModule {}
