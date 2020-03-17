import { Observable, reactive } from "../util/observable";

export class DropShadow extends Observable {
    @reactive('change') enabled = true;
    @reactive('change') color = 'rgba(0, 0, 0, 0.5)';
    @reactive('change') xOffset = 0;
    @reactive('change') yOffset = 0;
    @reactive('change') blur = 5;
}
