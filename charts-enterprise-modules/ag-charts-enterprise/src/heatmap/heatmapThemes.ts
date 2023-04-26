interface ChartThemeParams {
    seriesDefaults: any;
    defaultFontFamily: string;
}

interface DarkThemeParams {
    seriesLabelDefaults: any;
}

export function getHeatmapDefaultTheme(params: ChartThemeParams) {
    return {
        ...params.seriesDefaults,
        title: undefined,
        xKey: '',
        yKey: '',
        labelKey: undefined,
        xName: '',
        yName: '',
        labelName: 'Label',
        colorRange: ['red', 'blue'],
        label: {
            enabled: false,
            fontStyle: undefined,
            fontWeight: undefined,
            fontSize: 12,
            fontFamily: params.defaultFontFamily,
            color: 'rgb(70, 70, 70)',
        },
    };
}

export function getHeatmapDarkTheme(params: DarkThemeParams) {
    return {
        ...params.seriesLabelDefaults,
    };
}
