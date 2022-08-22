import { getFont } from '../scene/shape/text';
export class Label {
    constructor() {
        this.enabled = true;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.color = 'rgba(70, 70, 70, 1)';
    }
    getFont() {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}
