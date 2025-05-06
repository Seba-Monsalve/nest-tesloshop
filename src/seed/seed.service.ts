import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed.data';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const user = await this.insertUsers();
    await this.inserNewProducts(user);
  }

  async deleteTables() {
    await this.productsService.deleteAllProducts();
    await this.userRepository.delete({});
  }

  private async insertUsers() {
    const users: User[] = [];
    initialData.users.forEach((user) => {
      users.push(
        this.userRepository.create({
          ...user,
          password: bcrypt.hashSync(user.password, 10),
        }),
      );
    });
    console.log({ users });
    const dbUsers = await this.userRepository.save(users);
    console.log({ dbUsers });
    return dbUsers[0];
  }

  private async inserNewProducts(user) {
    // hacer uno por uno
    // initialData.products.forEach(async (product) => {
    //   await this.productsService.create(product);
    // });
    // hacerlo de manera simultanea

    const insertPromise: Promise<any>[] = [];

    initialData.products.forEach((product) => {
      insertPromise.push(this.productsService.create(product, user));
    });

    await Promise.all(insertPromise);

    return true;
  }
}
