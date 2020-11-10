import { BaseMetadataStore, Class, ClassMetadata } from 'class-fixtures-factory';
import { MikroORM } from '@mikro-orm/core';
export declare class MetadataStore extends BaseMetadataStore {
    private readonly orm;
    private defaultStore;
    constructor(orm: MikroORM);
    make(classType: Class): ClassMetadata;
}
