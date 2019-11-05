import { FontStyle, FontWeight } from "../scene/shape/text";
import { Observable, reactive } from "../util/observable";

export class Label extends Observable {
    @reactive(['style', 'data']) enabled = true;
    @reactive(['style']) fontStyle?: FontStyle;
    @reactive(['style']) fontWeight?: FontWeight;
    @reactive(['style']) fontSize = 12;
    @reactive(['style']) fontFamily = 'Verdana, sans-serif';
    @reactive(['style']) color = 'black';

    constructor() {
        super();
    }
}
