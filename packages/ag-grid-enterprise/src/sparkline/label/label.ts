import type { FontStyle, FontWeight } from 'ag-charts-types';

export class Label {
    enabled = true;
    fontSize = 8;
    fontFamily = 'Verdana, sans-serif';
    fontStyle?: FontStyle = undefined;
    fontWeight?: FontWeight = undefined;
    color = 'rgba(70, 70, 70, 1)';
}
