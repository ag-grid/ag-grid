import { FontStyle, FontWeight } from "../scene/shape/text";
import { Observable, reactive } from "../util/observable";

export class Label extends Observable {
    @reactive('change', 'dataChange') enabled = true;
    @reactive('change') fontStyle?: FontStyle;
    @reactive('change') fontWeight?: FontWeight;
    @reactive('change') fontSize = 12;
    @reactive('change') fontFamily = 'Verdana, sans-serif';
    @reactive('change') color = 'rgba(70, 70, 70, 1)';

    constructor() {
        super();
    }
}
