var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Text } from './scene/shape/text';
import { PointerEvents } from './scene/node';
import { BOOLEAN, NUMBER, OPT_COLOR_STRING, OPT_FONT_STYLE, OPT_FONT_WEIGHT, OPT_NUMBER, OPT_STRING, STRING, TEXT_WRAP, Validate, } from './util/validation';
import { ProxyPropertyOnWrite } from './util/proxy';
var Caption = /** @class */ (function () {
    function Caption() {
        this.node = new Text();
        this.enabled = false;
        this.text = undefined;
        this.fontSize = 10;
        this.fontFamily = 'sans-serif';
        this.spacing = Caption.PADDING;
        this.lineHeight = undefined;
        this.maxWidth = undefined;
        this.maxHeight = undefined;
        this.wrapping = 'always';
        var node = this.node;
        node.textAlign = 'center';
        node.pointerEvents = PointerEvents.None;
    }
    Caption.prototype.computeTextWrap = function (containerWidth, containerHeight) {
        var _a, _b;
        var _c = this, text = _c.text, wrapping = _c.wrapping;
        var maxWidth = Math.min((_a = this.maxWidth) !== null && _a !== void 0 ? _a : Infinity, containerWidth);
        var maxHeight = (_b = this.maxHeight) !== null && _b !== void 0 ? _b : containerHeight;
        if (!isFinite(maxWidth) && !isFinite(maxHeight)) {
            this.node.text = text;
            return;
        }
        var wrapped = Text.wrap(text !== null && text !== void 0 ? text : '', maxWidth, maxHeight, this, wrapping);
        this.node.text = wrapped;
    };
    Caption.PADDING = 10;
    __decorate([
        Validate(BOOLEAN)
    ], Caption.prototype, "enabled", void 0);
    __decorate([
        Validate(OPT_STRING),
        ProxyPropertyOnWrite('node')
    ], Caption.prototype, "text", void 0);
    __decorate([
        Validate(OPT_FONT_STYLE),
        ProxyPropertyOnWrite('node')
    ], Caption.prototype, "fontStyle", void 0);
    __decorate([
        Validate(OPT_FONT_WEIGHT),
        ProxyPropertyOnWrite('node')
    ], Caption.prototype, "fontWeight", void 0);
    __decorate([
        Validate(NUMBER(0)),
        ProxyPropertyOnWrite('node')
    ], Caption.prototype, "fontSize", void 0);
    __decorate([
        Validate(STRING),
        ProxyPropertyOnWrite('node')
    ], Caption.prototype, "fontFamily", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING),
        ProxyPropertyOnWrite('node', 'fill')
    ], Caption.prototype, "color", void 0);
    __decorate([
        Validate(OPT_NUMBER(0))
    ], Caption.prototype, "spacing", void 0);
    __decorate([
        Validate(OPT_NUMBER(0))
    ], Caption.prototype, "lineHeight", void 0);
    __decorate([
        Validate(OPT_NUMBER(0))
    ], Caption.prototype, "maxWidth", void 0);
    __decorate([
        Validate(OPT_NUMBER(0))
    ], Caption.prototype, "maxHeight", void 0);
    __decorate([
        Validate(TEXT_WRAP)
    ], Caption.prototype, "wrapping", void 0);
    return Caption;
}());
export { Caption };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jYXB0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFDSCxPQUFPLEVBQ1AsTUFBTSxFQUNOLGdCQUFnQixFQUNoQixjQUFjLEVBQ2QsZUFBZSxFQUNmLFVBQVUsRUFDVixVQUFVLEVBQ1YsTUFBTSxFQUNOLFNBQVMsRUFDVCxRQUFRLEdBQ1gsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFcEQ7SUErQ0k7UUE1Q1MsU0FBSSxHQUFTLElBQUksSUFBSSxFQUFFLENBQUM7UUFHakMsWUFBTyxHQUFHLEtBQUssQ0FBQztRQUloQixTQUFJLEdBQVksU0FBUyxDQUFDO1FBWTFCLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFJdEIsZUFBVSxHQUFXLFlBQVksQ0FBQztRQU8zQixZQUFPLEdBQVksT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUcxQyxlQUFVLEdBQXVCLFNBQVMsQ0FBQztRQUczQyxhQUFRLEdBQVksU0FBUyxDQUFDO1FBRzlCLGNBQVMsR0FBWSxTQUFTLENBQUM7UUFHL0IsYUFBUSxHQUFhLFFBQVEsQ0FBQztRQUcxQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQztJQUM1QyxDQUFDO0lBRUQsaUNBQWUsR0FBZixVQUFnQixjQUFzQixFQUFFLGVBQXVCOztRQUNyRCxJQUFBLEtBQXFCLElBQUksRUFBdkIsSUFBSSxVQUFBLEVBQUUsUUFBUSxjQUFTLENBQUM7UUFDaEMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFBLElBQUksQ0FBQyxRQUFRLG1DQUFJLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNyRSxJQUFNLFNBQVMsR0FBRyxNQUFBLElBQUksQ0FBQyxTQUFTLG1DQUFJLGVBQWUsQ0FBQztRQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUN0QixPQUFPO1NBQ1Y7UUFDRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksYUFBSixJQUFJLGNBQUosSUFBSSxHQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7SUFDN0IsQ0FBQztJQTlEZSxlQUFPLEdBQUcsRUFBRSxDQUFDO0lBSzdCO1FBREMsUUFBUSxDQUFDLE9BQU8sQ0FBQzs0Q0FDRjtJQUloQjtRQUZDLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFDcEIsb0JBQW9CLENBQUMsTUFBTSxDQUFDO3lDQUNIO0lBSTFCO1FBRkMsUUFBUSxDQUFDLGNBQWMsQ0FBQztRQUN4QixvQkFBb0IsQ0FBQyxNQUFNLENBQUM7OENBQ0k7SUFJakM7UUFGQyxRQUFRLENBQUMsZUFBZSxDQUFDO1FBQ3pCLG9CQUFvQixDQUFDLE1BQU0sQ0FBQzsrQ0FDTTtJQUluQztRQUZDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsb0JBQW9CLENBQUMsTUFBTSxDQUFDOzZDQUNQO0lBSXRCO1FBRkMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUNoQixvQkFBb0IsQ0FBQyxNQUFNLENBQUM7K0NBQ0s7SUFJbEM7UUFGQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7UUFDMUIsb0JBQW9CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQzswQ0FDWDtJQUcxQjtRQURDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7NENBQ2tCO0lBRzFDO1FBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzsrQ0FDbUI7SUFHM0M7UUFEQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDOzZDQUNNO0lBRzlCO1FBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs4Q0FDTztJQUcvQjtRQURDLFFBQVEsQ0FBQyxTQUFTLENBQUM7NkNBQ1U7SUFtQmxDLGNBQUM7Q0FBQSxBQWhFRCxJQWdFQztTQWhFWSxPQUFPIn0=