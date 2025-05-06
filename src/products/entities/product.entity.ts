import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/auth.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    example: '20fdf6ef-f875-49e6-8bd2-b914c74e3d41',
    description: 'ID único del producto',
  })
  id: string;

  @ApiProperty({
    example: 'Camiseta de algodón',
    description: 'Título del producto',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({
    example: 19.99,
    description: 'Precio del producto',
    default: 0,
  })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    example: 'Camiseta de algodón 100% para hombre',
    description: 'Descripción del producto',
    nullable: true,
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({
    example: 'camiseta-de-algodon',
    description: 'Slug único generado a partir del título',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    example: 100,
    description: 'Cantidad de productos disponibles en stock',
    default: 0,
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L', 'XL'],
    description: 'Tamaños disponibles para el producto',
    isArray: true,
    default: [],
  })
  @Column('text', { array: true, default: [] })
  sizes: string[];

  @ApiProperty({
    example: 'men',
    description: 'Género al que está dirigido el producto (men, women, unisex)',
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    example: ['algodón', 'camiseta', 'ropa'],
    description: 'Etiquetas asociadas al producto',
    isArray: true,
    default: [],
  })
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty({
    example: [
      { url: 'https://example.com/image1.jpg' },
      { url: 'https://example.com/image2.jpg' },
    ],
    description: 'Imágenes asociadas al producto',
    type: () => [ProductImage],
  })
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title.replace(/\s+/g, '-').toLowerCase();
    }
  }
  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.title.replace(/\s+/g, '-').toLowerCase();
  }
}
