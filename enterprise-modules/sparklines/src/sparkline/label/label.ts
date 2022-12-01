import { FontStyle, FontWeight } from 'ag-charts-community';
import { Observable, reactive } from '../../util/observable';

export class Label extends Observable {
    @reactive('change', 'dataChange') enabled = true;
    @reactive('change') fontSize = 8;
    @reactive('change') fontFamily = 'Verdana, sans-serif';
    @reactive('change') fontStyle?: FontStyle;
    @reactive('change') fontWeight?: FontWeight;
    @reactive('change') color = 'rgba(70, 70, 70, 1)';

    constructor() {
        super();
    }
}