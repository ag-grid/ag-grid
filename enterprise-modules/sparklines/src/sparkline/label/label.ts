import { FontStyle, FontWeight, getFont } from '../../scene/shape/text';
import { Observable, reactive } from '../../util/observable';

export class Label extends Observable {
    @reactive('change', 'dataChange') enabled = true;
    @reactive('change') fontSize = 8;
    @reactive('change') fontFamily = 'Verdana, sans-serif';
    @reactive('change') fontStyle?: FontStyle;
    @reactive('change') fontWeight?: FontWeight;
    @reactive('change') color = 'rgba(70, 70, 70, 1)';

    getFont(): string {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }

    constructor() {
        super();
    }
}