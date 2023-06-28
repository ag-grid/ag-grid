import { _Theme } from 'ag-charts-community';

export const ANGLE_CATEGORY_AXIS_THEME = {
    __extends__: _Theme.EXTENDS_AXES_DEFAULTS,
    label: {
        autoRotateAngle: 0,
        __extends__: _Theme.EXTENDS_AXES_LABEL_DEFAULTS,
    },
    line: {
        width: 1.5,
        __extends__: _Theme.EXTENDS_AXES_LINE_DEFAULTS,
    },
};
