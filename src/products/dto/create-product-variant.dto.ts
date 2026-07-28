import { IsString, IsNumber, IsNotEmpty, IsOptional, IsObject, Min } from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  skuVariant!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priceOverride?: number;

  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @IsObject()
  @IsNotEmpty()
  attributes!: Record<string, any>;
}