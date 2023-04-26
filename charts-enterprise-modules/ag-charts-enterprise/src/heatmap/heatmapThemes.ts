import { _Theme } from 'ag-charts-community';

export const HEATMAP_SERIES_THEME = {
    __extends__: _Theme.EXTENDS_SERIES_DEFAULTS,
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
        fontFamily: _Theme.DEFAULT_FONT_FAMILY,
        color: 'rgb(70, 70, 70)',
        __overrides__: _Theme.OVERRIDE_SERIES_LABEL_DEFAULTS,
    },
};
