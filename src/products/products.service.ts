import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
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
    // Conectar el cliente de Kafka al arrancar el módulo
    await this.kafkaClient.connect();
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
    this.kafkaClient.emit('product.created', JSON.stringify({
      eventId: crypto.randomUUID(),
      eventType: 'PRODUCT_CREATED',
      timestamp: new Date().toISOString(),
      payload: newProduct,
    }));

    return newProduct;
  }

  async findAll() {
    const product = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { variants: true },
    });

    this.kafkaClient.emit('catalog.viewed', JSON.stringify({
      timestamp: new Date().toISOString(),
      totalProductsRetrieved: product.length,
    }))

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