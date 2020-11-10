import { Collection } from '@mikro-orm/core';
import { Book } from './book.entity';
import { BaseEntity } from './base.entity';
export declare class BookTag extends BaseEntity {
    label: string;
    books: Collection<Book, unknown>;
}
