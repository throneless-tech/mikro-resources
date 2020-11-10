import { __extends, __values, __spread, __awaiter, __generator } from 'tslib';
import { DefaultMetadataStore, BaseMetadataStore, FixtureFactory as FixtureFactory$1 } from 'class-fixtures-factory';
import { Utils } from '@mikro-orm/core';

var MetadataStore = /** @class */ (function (_super) {
    __extends(MetadataStore, _super);
    function MetadataStore(orm) {
        var _this = _super.call(this) || this;
        _this.orm = orm;
        _this.defaultStore = new DefaultMetadataStore(true);
        return _this;
    }
    MetadataStore.prototype.make = function (classType) {
        var name = Utils.className(classType.name);
        var defaultMeta = this.defaultStore.make(classType);
        var meta;
        try {
            meta = this.orm.getMetadata().get(name);
        }
        catch (error) {
            return (this.store[name] = defaultMeta);
        }
        var classMetadata = {
            name: name,
            properties: Object.values(meta.properties)
                .map(function (prop) {
                var defaultMetaProp = defaultMeta.properties.find(function (p) { return p.name === prop.name; });
                if (prop.primary)
                    return null;
                if (prop.type === 'method')
                    return null;
                return {
                    name: prop.name,
                    type: prop.type,
                    array: ['1:m', 'm:n'].includes(prop.reference),
                    "enum": prop["enum"],
                    ignore: defaultMetaProp === null || defaultMetaProp === void 0 ? void 0 : defaultMetaProp.ignore,
                    input: defaultMetaProp === null || defaultMetaProp === void 0 ? void 0 : defaultMetaProp.input,
                    items: prop.items || (defaultMetaProp === null || defaultMetaProp === void 0 ? void 0 : defaultMetaProp.items),
                    max: (defaultMetaProp === null || defaultMetaProp === void 0 ? void 0 : defaultMetaProp.max) || 3,
                    min: (defaultMetaProp === null || defaultMetaProp === void 0 ? void 0 : defaultMetaProp.min) || 1,
                    scalar: prop.reference === 'scalar' || (defaultMetaProp === null || defaultMetaProp === void 0 ? void 0 : defaultMetaProp.scalar),
                };
            })
                .filter(Boolean),
        };
        return (this.store[name] = classMetadata);
    };
    return MetadataStore;
}(BaseMetadataStore));

var FixtureFactory = /** @class */ (function () {
    function FixtureFactory(orm, options) {
        this.orm = orm;
        this.factory = new FixtureFactory$1(options);
        var store = new MetadataStore(orm);
        this.factory.setMetadataStore(store);
        this.registerAllEntities();
        this.factory.setAssigner(this.assigner.bind(this));
    }
    FixtureFactory.prototype.register = function (classTypes) {
        this.factory.register(classTypes);
    };
    FixtureFactory.prototype.registerAllEntities = function () {
        var e_1, _a;
        var metadata = this.orm.getMetadata();
        var entityNames = Object.keys(metadata.getAll()).filter(function (v) { return v[0] === v[0].toUpperCase(); });
        try {
            for (var entityNames_1 = __values(entityNames), entityNames_1_1 = entityNames_1.next(); !entityNames_1_1.done; entityNames_1_1 = entityNames_1.next()) {
                var name_1 = entityNames_1_1.value;
                var classType = metadata.get(name_1)["class"];
                this.register([classType]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (entityNames_1_1 && !entityNames_1_1.done && (_a = entityNames_1["return"])) _a.call(entityNames_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    FixtureFactory.prototype.assigner = function (prop, obj, value) {
        var _a;
        // TODO: find a better way to detect Collections
        if (Array.isArray(value) && obj[prop.name].add) {
            (_a = obj[prop.name]).add.apply(_a, __spread(value));
        }
        else {
            obj[prop.name] = value;
        }
    };
    FixtureFactory.prototype.make = function (entityName) {
        var _this = this;
        var baseResult = this.factory.make(entityName);
        return {
            ignore: baseResult.ignore,
            "with": baseResult["with"],
            many: baseResult.many,
            one: baseResult.one,
            oneAndPersist: function () { return __awaiter(_this, void 0, void 0, function () {
                var entity;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            entity = baseResult.one();
                            return [4 /*yield*/, this.orm.em.persistAndFlush(entity)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, entity];
                    }
                });
            }); },
            manyAndPersist: function (x) { return __awaiter(_this, void 0, void 0, function () {
                var entities;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            entities = baseResult.many(x);
                            return [4 /*yield*/, this.orm.em.persistAndFlush(entities)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, entities];
                    }
                });
            }); },
        };
    };
    return FixtureFactory;
}());

export { FixtureFactory, MetadataStore };
//# sourceMappingURL=fixtures.esm.js.map
