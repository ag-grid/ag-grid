import { clamp } from '../../model/utils';

export type ColorEditorProps = {
  onChange: (value: string | number) => void;
  preventTransparency: boolean | undefined;
  preventVariables: boolean | undefined;
};

export type ControlledColorEditorProps = ColorEditorProps & {
  value: string;
};

export type UncontrolledColorEditorProps = ColorEditorProps & {
  initialValue: string;
};

export const proportionToHex2 = (f: number) => numberToHex2(Math.floor(f * 256));

export const numberToHex2 = (n: number) =>
  Math.round(clamp(n, 0, 255))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

export const int = (n: number, max: number) => clamp(Math.floor(n * (max * 1)), 0, max);

export const formatProportionAsPercent = (n: number) => `${Math.round(n * 100)}%`;

export const formatProportionAsDegrees = (n: number) => `${Math.round(n * 360)}°`;

export const format3dp = (n: number) => String(Math.round(n * 1000) / 1000);

export const formatProportionAs3dpPercent = (n: number) =>
  String((Math.round(n * 1000) / 10).toFixed(1)) + '%';
