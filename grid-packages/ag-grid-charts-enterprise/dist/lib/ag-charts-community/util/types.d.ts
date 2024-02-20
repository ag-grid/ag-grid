export type PlainObject = {
    [key: string | number | symbol]: any;
};
export type Has<P extends keyof T, T> = T & {
    [K in P]-?: T[P];
};
export type Mutable<T> = T extends object ? {
    -readonly [K in keyof T]: Mutable<T[K]>;
} : T;
export type Defined<T> = T extends undefined ? never : T;
export type DeepRequired<T> = T extends (...args: any[]) => any ? T : T extends any[] ? _DeepRequiredArray<T[number]> : T extends object ? _DeepRequiredObject<T> : T;
type _DeepRequiredArray<T> = Array<DeepRequired<Defined<T>>>;
type _DeepRequiredObject<T> = {
    [K in keyof T]-?: DeepRequired<Defined<T[K]>>;
};
export type DeepPartial<T> = T extends Array<unknown> ? T : T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T;
export type PickRequired<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};
export type RequireOptional<T> = {
    [K in keyof Required<T>]: T[K] extends Required<T[K]> ? T[K] : T[K] | undefined;
};
export type Intersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export {};
