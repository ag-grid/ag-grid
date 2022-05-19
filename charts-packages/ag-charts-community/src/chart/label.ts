import { FontStyle, FontWeight, getFont } from "../scene/shape/text";

export class Label {
    enabled = true;
    fontSize = 12;
    fontFamily = 'Verdana, sans-serif';
    fontStyle?: FontStyle = undefined;
    fontWeight?: FontWeight = undefined;
    color = 'rgba(70, 70, 70, 1)';

    getFont(): string {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}
