import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images, ...rest } = createProductDto;
      const product = this.productRepository.create({
        ...rest,
        images: images.map((image) => {
          const productImage = this.productImageRepository.create({
            url: image,
          });
          return productImage;
        }),
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;

      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        },
      });

      return products.map((product) => {
        return {
          ...product,
          images: product.images?.map((image) => image.url),
        };
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(term: string) {
    let product: Product | null;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
        .where('LOWER(title) =:title or slug =:slug', {
          title: term.toLowerCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
    }
    if (!product) {
      throw new NotFoundException(`Product with term ${term} not found`);
    }
    return { ...product, images: product.images?.map((image) => image.url) };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...rest } = updateProductDto;
    let product = await this.productRepository.preload({
      id,
      ...rest,
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) => {
          const productImage = this.productImageRepository.create({
            url: image,
            product,
          });
          return productImage;
        });
      } else {
      }

      await queryRunner.manager.save(product.images);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      // product = await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const product = await this.productRepository.delete(id);
    if (product.affected === 0) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  private handleError(error: any) {
    if (error.code == 23505) throw new BadRequestException(error.detail);
    if (error.statusCode) throw error;
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Could not create product - check server logs',
    );
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    
    
    try {
      await query.delete().execute();

    } catch (error) {
      this.handleError(error);
    }
  }
}
