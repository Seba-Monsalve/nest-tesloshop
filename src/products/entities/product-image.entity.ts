import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({name: 'product_images'}) // Nombre de la tabla en la base de datos
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @ManyToOne( 
    () => Product,
    (product) => product.images,
    { onDelete: 'CASCADE' } // Eliminar imagenes si se elimina el producto
  )
  product:Product
}
