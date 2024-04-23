export * from "./utils";
export * from "./numberSequence";
export * from "./promise";
export * from "./timer";
declare const __brand: unique symbol;
type BrandSymbol<B> = {
    [__brand]: B;
};
export type BrandedType<T, B> = T & BrandSymbol<B>;
