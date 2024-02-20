import type { SeriesPaletteFactoryParams } from './coreModulesTypes';
export declare const singleSeriesPaletteFactory: ({ takeColors }: SeriesPaletteFactoryParams) => {
    fill: string;
    stroke: string;
};
export declare const markerPaletteFactory: (params: SeriesPaletteFactoryParams) => {
    marker: {
        fill: string;
        stroke: string;
    };
};
