declare const __brand: unique symbol;
type BrandSymbol<B> = { [__brand]: B };
// BrandedTypes enable us to create types that unique even if under the hood they are all strings.
// This is useful for preventing accidental mixing of different ids, i.e column.getId vs cellCtrl.getId.
export type BrandedType<T, B> = T & BrandSymbol<B>;
