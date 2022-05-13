import { Observable } from "../util/observable";

export class DropShadow extends Observable {
    enabled = true;
    color = 'rgba(0, 0, 0, 0.5)';
    xOffset = 0;
    yOffset = 0;
    blur = 5;
}
