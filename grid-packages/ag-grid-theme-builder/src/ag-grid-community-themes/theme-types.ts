import { VariableTypes } from '.';

export type CssFragment = string | ((params: Record<string, any>) => string);

export type Part<T extends string = string> = {
  partId: string;
  params: T[];
  defaults?: { [K in T]: K extends keyof VariableTypes ? VariableTypes[K] : any };
  css?: CssFragment[];
  conditionalCss?: Record<string, CssFragment | undefined>;
  icons?: Record<string, string>;
  presets?: Record<string, Record<string, any>>;
};

export type CombinedParts<T extends string> = {
  params: T[];
  componentParts: AnyPart[];
};

export type AnyPart = Part<string> | CombinedParts<string>;
