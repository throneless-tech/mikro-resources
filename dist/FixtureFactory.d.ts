import { FactoryOptions, Class } from 'class-fixtures-factory';
import { MikroORM } from '@mikro-orm/core';
import { DeepPartial, EntityClass } from '@mikro-orm/core/typings';
export interface FactoryResult<T> {
    one: () => T;
    many: (x: number) => T[];
    oneAndPersist: () => Promise<T>;
    manyAndPersist: (x: number) => Promise<T[]>;
    with: (input: DeepPartial<T>) => FactoryResult<T>;
    ignore: (...props: (keyof T)[]) => FactoryResult<T>;
}
export declare class FixtureFactory {
    private readonly orm;
    private factory;
    constructor(orm: MikroORM, options?: FactoryOptions);
    register(classTypes: Class[]): void;
    private registerAllEntities;
    private assigner;
    make<Entity = object>(entityName: EntityClass<Entity>): FactoryResult<Entity>;
}
