import { Param, ParamTypes } from '.';

export type CssFragment = string | ((params: Record<string, any>) => string);

export type Part<T extends string = string> = {
  partId: string;
  params: T[];
  defaults?: { [K in T]: K extends Param ? ParamTypes[K] : any };
  css?: CssFragment[];
  icons?: Record<string, string>;
  presets?: Record<string, Record<string, any>>;
};

export type CombinedParts<T extends string> = {
  params: T[];
  componentParts: AnyPart[];
};

export type AnyPart = Part<string> | CombinedParts<string>;
