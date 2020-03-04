import {
  MikroORM,
  EntityName,
  Utils,
  EntityMetadata,
  EntityProperty,
  Collection,
} from 'mikro-orm';
import { FixtureMetadata, FixtureOptions } from './decorator';
import * as faker from 'faker';
import { Logger } from './logger';

export class FixturesFactory {
  logger = new Logger();
  constructor(private readonly orm: MikroORM) {}

  make<Entity = object>(
    entityName: EntityName<Entity>,
    propsToIgnore: string[] = []
  ) {
    const meta = this.orm.getMetadata();
    const name = Utils.className(entityName);
    const entityMeta = meta.get(name);
    const result = {
      one: () => this._make(entityMeta, entityName, propsToIgnore) as Entity,
      many: (x: number) => {
        return [...Array(x).keys()].map(() =>
          this._make(entityMeta, entityName, propsToIgnore)
        );
      },
      oneAndPersit: async () => {
        const entity = result.one();
        await this.orm.em.persistAndFlush(entity);
        return entity;
      },
      manyAndPersist: async (x: number) => {
        const entities = result.many(x);
        await this.orm.em.persistAndFlush(entities);
        return entities;
      },
    };
    return result;
  }

  _make(
    entityMeta: EntityMetadata,
    entityName: EntityName<any>,
    propsToIgnore: string[]
  ) {
    const entity = this.orm.em.getRepository(entityName).create({});
    for (const [key, prop] of Object.entries(entityMeta.properties)) {
      const fixtureMeta = (FixtureMetadata[Utils.className(entityName)] || {})[
        key
      ];
      if (propsToIgnore.includes(key)) continue;
      if (this._shouldIgnoreProperty(fixtureMeta, prop)) continue;
      this._makeProperty(entity, fixtureMeta, prop, entityMeta);
    }
    return entity;
  }

  _makeProperty(
    entity: any,
    fixtureMeta: FixtureOptions,
    prop: EntityProperty,
    entityMeta: EntityMetadata
  ) {
    if (typeof fixtureMeta === 'function') {
      entity[prop.name] = fixtureMeta(faker);
      return;
    } else if (typeof fixtureMeta === 'string') {
      entity[prop.name] = faker.fake(fixtureMeta);
      return;
    }
    // Auto
    switch (prop.reference) {
      case 'scalar':
        this._makeScalarProperty(entity, fixtureMeta, prop, entityMeta);
        return;
      case '1:m':
        this._makeOneToManyProperty(entity, fixtureMeta, prop, entityMeta);
        return;
      case 'm:1':
        this._makeManyToOneProperty(entity, fixtureMeta, prop, entityMeta);
        return;
      case '1:1':
        this._makeOneToOneProperty(entity, fixtureMeta, prop, entityMeta);
        return;
      case 'm:n':
        this._makeManyToManyProperty(entity, fixtureMeta, prop, entityMeta);
        return;
      default:
        break;
    }
    return this.logger.error(`Cannot handle this property`, prop);
  }

  _shouldIgnoreProperty(fixtureMeta: FixtureOptions, prop: EntityProperty) {
    if (prop.primary) return true;
    if (prop.type === 'method') return true;
    if (typeof fixtureMeta === 'object' && fixtureMeta.ignore) return true;
    return false;
  }

  _makeScalarProperty(
    entity: any,
    fixtureMeta: FixtureOptions,
    prop: EntityProperty,
    entityMeta: EntityMetadata
  ) {
    switch (prop.type) {
      case 'string':
        entity[prop.name] = faker.random.word();
        return;
      case 'number':
        entity[prop.name] = faker.random.number();
        return;
      case 'boolean':
        entity[prop.name] = faker.random.boolean();
        return;
      case 'Date':
        entity[prop.name] = faker.date.recent();
        return;
      default:
        if (prop.enum) {
          if (prop.items) {
            entity[prop.name] = faker.random.arrayElement(
              this._isIntegerEnum(prop)
                ? [...Array(prop.items.length).keys()]
                : prop.items
            );
            return;
          }
          if (typeof fixtureMeta === 'object' && !!fixtureMeta.enum) {
            const items = Utils.extractEnumValues(fixtureMeta.enum);
            entity[prop.name] = faker.random.arrayElement(
              this._isIntegerEnum(prop)
                ? [...Array(items.length).keys()]
                : items
            );
            return;
          }
          this.logger.error(
            `Can't generate enums without assistance. Use @Fixture({ enum: EnumType })`
          );
        }
        break;
    }
    this.logger.error(`Can't generate a value for this scalar`, prop);
  }

  _makeOneToManyProperty(
    entity: any,
    fixtureMeta: FixtureOptions,
    prop: EntityProperty,
    entityMeta: EntityMetadata
  ) {
    const refSideProperty =
      prop.mappedBy || this._findMappedBy(entityMeta, prop, 'm:1');
    const amount =
      typeof fixtureMeta === 'object'
        ? faker.random.number({
            min: fixtureMeta.min || 1,
            max: fixtureMeta.max || 5,
          })
        : faker.random.number({ min: 1, max: 5 });
    const elements = [...Array(amount).keys()].map(() =>
      this.make(prop.type, [refSideProperty]).one()
    );
    (entity[prop.name] as Collection<any>).add(...elements);
  }

  _makeManyToOneProperty(
    entity: any,
    fixtureMeta: FixtureOptions,
    prop: EntityProperty,
    entityMeta: EntityMetadata
  ) {
    const refSideProperty =
      prop.mappedBy || this._findMappedBy(entityMeta, prop, '1:m');
    entity[prop.name] = this.make(prop.type, [refSideProperty]).one();
  }

  _makeManyToManyProperty(
    entity: any,
    fixtureMeta: FixtureOptions,
    prop: EntityProperty,
    entityMeta: EntityMetadata
  ) {
    const refSideProperty =
      prop.mappedBy || this._findMappedBy(entityMeta, prop, 'm:n');
    const amount =
      typeof fixtureMeta === 'object'
        ? faker.random.number({
            min: fixtureMeta.min || 1,
            max: fixtureMeta.max || 5,
          })
        : faker.random.number({ min: 1, max: 5 });
    const elements = [...Array(amount).keys()].map(() =>
      this.make(prop.type, [refSideProperty]).one()
    );
    (entity[prop.name] as Collection<any>).add(...elements);
  }

  _makeOneToOneProperty(
    entity: any,
    fixtureMeta: FixtureOptions,
    prop: EntityProperty,
    entityMeta: EntityMetadata
  ) {
    const refSideProperty =
      prop.mappedBy || this._findMappedBy(entityMeta, prop, '1:1');
    entity[prop.name] = this.make(prop.type, [refSideProperty]).one();
  }

  _findMappedBy(
    entityMeta: EntityMetadata,
    prop: EntityProperty,
    reference: string
  ) {
    const refEntityMeta = this.orm.getMetadata().get(prop.type);
    for (const [key, refProp] of Object.entries(refEntityMeta.properties)) {
      if (refProp.reference === reference && refProp.type === entityMeta.name) {
        return refProp.name;
      }
    }
    throw new Error('');
  }

  _isIntegerEnum(prop: EntityProperty) {
    return ['tinyint', 'int'].some(type => prop.columnType.match(type));
  }
}
