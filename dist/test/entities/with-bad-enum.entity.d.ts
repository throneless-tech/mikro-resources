import { BaseEntity } from './base.entity';
export declare enum FooEnum {
    A = 0,
    B = 1,
    C = 2
}
export declare class WithBadEnum extends BaseEntity {
    enum: FooEnum;
}
