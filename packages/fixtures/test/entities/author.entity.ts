import {
  IdEntity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  Entity,
  OneToOne,
  Enum,
} from 'mikro-orm';
import { Book } from './book.entity';
import { BaseEntity } from './base.entity';
import { Address } from './address.entity';
import { Fixture } from '../../src/decorator';

export enum Mood {
  GOOD,
  BAD,
  NEUTRAL,
}

@Entity()
export class Author extends BaseEntity {
  @Property()
  name!: string;

  @Property()
  age!: number;

  @Enum()
  mood!: Mood;

  @Fixture({ min: 3, max: 3})
  @OneToMany(
    () => Book,
    book => book.author
  )
  books = new Collection<Book>(this);

  @OneToOne(
    () => Address,
    addr => addr.author
  )
  address!: Address;
}
