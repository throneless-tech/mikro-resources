import { BaseEntity } from './base.entity';
import { Author } from './author.entity';
export declare class Address extends BaseEntity {
    city: string;
    author: Author;
}
