import type { Scale } from './scale';
export declare class ColorScale implements Scale<number, string, number> {
    domain: number[];
    range: string[];
    private parsedRange;
    update(): void;
    convert(x: number): string;
}
//# sourceMappingURL=colorScale.d.ts.map