import { _Theme } from 'ag-charts-community';

export const RADAR_SERIES_THEME = {
    __extends__: _Theme.EXTENDS_SERIES_DEFAULTS,
    label: {
        enabled: false,
        fontSize: 12,
        fontFamily: _Theme.DEFAULT_FONT_FAMILY,
        color: 'rgb(70, 70, 70)',
        __overrides__: _Theme.OVERRIDE_SERIES_LABEL_DEFAULTS,
    },
    marker: {
        enabled: true,
        fillOpacity: 1,
        formatter: undefined,
        shape: 'circle',
        size: 6,
        strokeOpacity: 1,
        strokeWidth: 1,
    },
};
