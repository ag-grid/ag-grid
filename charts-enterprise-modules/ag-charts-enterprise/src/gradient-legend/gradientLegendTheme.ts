import { _ModuleSupport, _Scale, _Theme } from 'ag-charts-community';

export const GRADIENT_LEGEND_THEME = {
    __extends__: _Theme.EXTENDS_LEGEND_DEFAULTS,
    enabled: true,
    gradient: {
        preferredLength: 100,
        thickness: 16,
    },
    label: {
        color: 'black',
        fontFamily: _Theme.DEFAULT_FONT_FAMILY,
        fontSize: 12,
        fontStyle: undefined,
        fontWeight: undefined,
        formatter: undefined,
        maxWidth: undefined,
        minSpacing: 8,
        padding: 8,
    },
    position: 'bottom',
    reverseOrder: false,
    spacing: 20,
};
