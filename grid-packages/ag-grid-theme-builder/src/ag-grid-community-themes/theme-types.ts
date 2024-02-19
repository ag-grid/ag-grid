import { VariableTypes } from '.';

export type Part<T extends string = string> = {
  partId: string;
  params: T[];
  defaults?: { [K in T]: K extends keyof VariableTypes ? VariableTypes[K] : any };
  css?: Array<string | (() => string)>;
  conditionalCss?: Record<string, string | (() => string) | undefined>;
  icons?: Record<string, string>;
  presets?: Record<string, Record<string, any>>;
};

export type CombinedParts<T extends string> = {
  params: T[];
  componentParts: AnyPart[];
};

export type AnyPart = Part<string> | CombinedParts<string>;
