import { Scale } from './scale';
export declare class ColorScale implements Scale<number, string> {
    domain: number[];
    private _range;
    private parsedRange;
    get range(): string[];
    set range(values: string[]);
    convert(x: number): string;
}
