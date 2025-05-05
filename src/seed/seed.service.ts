import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed.data';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    await this.inserNewProducts();
    return 'seed executed';
  }

  private async inserNewProducts() {
    await this.productsService.deleteAllProducts();

    // hacer uno por uno
    // initialData.products.forEach(async (product) => {
    //   await this.productsService.create(product);
    // });
    // hacerlo de manera simultanea

    const insertPromise: Promise<any>[] = [];

    initialData.products.forEach((product) => {
      insertPromise.push(this.productsService.create(product));
    });

    await Promise.all(insertPromise);

    return true;
  }
}
