import { Collection } from '@mikro-orm/core';
import { Author } from './author.entity';
import { BaseEntity } from './base.entity';
import { BookTag } from './book-tag.entity';
export declare enum BookType {
    DRAMA = "drama",
    ACTION = "action",
    SCI_FI = "sci-fi"
}
export declare class Book extends BaseEntity {
    name: string;
    onSale: boolean;
    type: BookType;
    author: Author;
    tags: Collection<BookTag>;
}
