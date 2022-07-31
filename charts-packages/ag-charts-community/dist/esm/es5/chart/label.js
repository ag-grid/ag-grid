import { getFont } from '../scene/shape/text';
var Label = /** @class */ (function () {
    function Label() {
        this.enabled = true;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.color = 'rgba(70, 70, 70, 1)';
    }
    Label.prototype.getFont = function () {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    };
    return Label;
}());
export { Label };
