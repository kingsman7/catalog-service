import { Module } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name:'KAFKA_SERVICE',
        transport:Transport.KAFKA,
        options:{
          client:{
            clientId: 'catalog-service',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
          }
        }
      }
    ])
  ], 
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
