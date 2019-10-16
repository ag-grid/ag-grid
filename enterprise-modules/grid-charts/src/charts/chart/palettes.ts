export interface Palette {
    fills: string[];
    strokes: string[];
}

export const borneo: Palette = {
    fills: [
        '#f3622d',
        '#fba71b',
        '#57b757',
        '#41a9c9',
        '#4258c9',
        '#9a42c8',
        '#c84164',
        '#888888'
    ],
    strokes: [
        '#aa4520',
        '#b07513',
        '#3d803d',
        '#2d768d',
        '#2e3e8d',
        '#6c2e8c',
        '#8c2d46',
        '#5f5f5f'
    ]
};

export const material: Palette = {
    fills: [
        '#f44336',
        '#e91e63',
        '#9c27b0',
        '#673ab7',
        '#3f51b5',
        '#2196f3',
        '#03a9f4',
        '#00bcd4',
        '#009688',
        '#4caf50',
        '#8bc34a',
        '#cddc39',
        '#ffeb3b',
        '#ffc107',
        '#ff9800',
        '#ff5722'
    ],
    strokes: [
        '#ab2f26',
        '#a31545',
        '#6d1b7b',
        '#482980',
        '#2c397f',
        '#1769aa',
        '#0276ab',
        '#008494',
        '#00695f',
        '#357a38',
        '#618834',
        '#909a28',
        '#b3a429',
        '#b38705',
        '#b36a00',
        '#b33d18'
    ]
};

export const pastel: Palette = {
    fills: [
        '#c16068',
        '#a2bf8a',
        '#ebcc87',
        '#80a0c3',
        '#b58dae',
        '#85c0d1'
    ],
    strokes: [
        '#874349',
        '#718661',
        '#a48f5f',
        '#5a7088',
        '#7f637a',
        '#5d8692'
    ]
};

export const bright: Palette = {
    fills: [
        '#5BC0EB',
        '#FDE74C',
        '#9BC53D',
        '#E55934',
        '#FA7921',
        '#fa3081'
    ],
    strokes: [
        '#4086a4',
        '#b1a235',
        '#6c8a2b',
        '#a03e24',
        '#af5517',
        '#af225a'
    ]
};

export const flat: Palette = {
    fills: [
        '#febe76',
        '#ff7979',
        '#badc58',
        '#f9ca23',
        '#f0932b',
        '#eb4c4b',
        '#6ab04c',
        '#7ed6df',
        '#e056fd',
        '#686de0'
    ],
    strokes: [
        '#b28553',
        '#b35555',
        '#829a3e',
        '#ae8d19',
        '#a8671e',
        '#a43535',
        '#4a7b35',
        '#58969c',
        '#9d3cb1',
        '#494c9d'
    ]
};

export default borneo;

export const palettes: Palette[] = [
    borneo,
    material,
    pastel,
    bright,
    flat
];
