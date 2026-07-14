import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
// PrismaService HERDA de PrismaClient — ganha todos os métodos de query dele (category, user, etc.)
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // OnModuleInit é um "lifecycle hook" — o Nest chama esse método automaticamente
  // assim que o módulo termina de ser inicializado
  async onModuleInit() {
    await this.$connect(); // abre a conexão com o banco
  }

  // O mesmo vale para o encerramento — chamado quando a aplicação está desligando
  async onModuleDestroy() {
    await this.$disconnect(); // fecha a conexão de forma limpa
  }
}
