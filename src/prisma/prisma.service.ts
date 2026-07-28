import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const url = process.env.DATABASE_URL ?? 'postgresql://admin:adminpassword@localhost:5433/ecommerce_db?schema=public';
    
    // Si estás usando el adapter de Postgres
    const adapter = new PrismaPg({ connectionString: url });

    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🔌 Conectado exitosamente a PostgreSQL desde NestJS');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}