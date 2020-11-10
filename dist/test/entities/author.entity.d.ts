import { Collection } from '@mikro-orm/core';
import { Book } from './book.entity';
import { BaseEntity } from './base.entity';
import { Address } from './address.entity';
export declare enum Mood {
    GOOD = "good",
    BAD = "bad",
    NEUTRAL = "neutral"
}
export declare class Author extends BaseEntity {
    name: string;
    age: number;
    mood: Mood;
    books: Collection<Book, unknown>;
    address: Address;
}
