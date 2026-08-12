import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
    } catch (err: any) {
      console.warn('⚠️ [AI Studio] Kafka broker not available. Microservice events disabled.');
    }
  }

  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.prisma.product.create({
      data: {
        sku: createProductDto.sku,
        name: createProductDto.name,
        slug: createProductDto.slug,
        description: createProductDto.description,
        basePrice: createProductDto.basePrice,
        metadata: createProductDto.metadata || {},
        variants: {
          create: createProductDto.variants || [],
        },
      },
      include: {
        variants: true,
      },
    });

    // 2. Emitir evento a Kafka para la analítica / IA
    try {
      this.kafkaClient.emit('product.created', JSON.stringify({
        eventId: crypto.randomUUID(),
        eventType: 'PRODUCT_CREATED',
        timestamp: new Date().toISOString(),
        payload: newProduct,
      }));
    } catch (err: any) {
      console.warn('⚠️ [AI Studio] Kafka emit product.created warning:', err?.message || err);
    }

    return newProduct;
  }

  async findAll() {
    const product = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { variants: true },
    });

    try {
      this.kafkaClient.emit('catalog.viewed', JSON.stringify({
        timestamp: new Date().toISOString(),
        totalProductsRetrieved: product.length,
      }));
    } catch (err: any) {
      console.warn('⚠️ [AI Studio] Kafka emit catalog.viewed warning:', err?.message || err);
    }

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
