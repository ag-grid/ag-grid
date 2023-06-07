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
export class Caption {
    constructor() {
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
        const node = this.node;
        node.textAlign = 'center';
        node.pointerEvents = PointerEvents.None;
    }
    computeTextWrap(containerWidth, containerHeight) {
        var _a, _b;
        const { text, wrapping } = this;
        const maxWidth = Math.min((_a = this.maxWidth) !== null && _a !== void 0 ? _a : Infinity, containerWidth);
        const maxHeight = (_b = this.maxHeight) !== null && _b !== void 0 ? _b : containerHeight;
        if (!isFinite(maxWidth) && !isFinite(maxHeight)) {
            this.node.text = text;
            return;
        }
        const wrapped = Text.wrap(text !== null && text !== void 0 ? text : '', maxWidth, maxHeight, this, wrapping);
        this.node.text = wrapped;
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jYXB0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFDSCxPQUFPLEVBQ1AsTUFBTSxFQUNOLGdCQUFnQixFQUNoQixjQUFjLEVBQ2QsZUFBZSxFQUNmLFVBQVUsRUFDVixVQUFVLEVBQ1YsTUFBTSxFQUNOLFNBQVMsRUFDVCxRQUFRLEdBQ1gsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFcEQsTUFBTSxPQUFPLE9BQU87SUErQ2hCO1FBNUNTLFNBQUksR0FBUyxJQUFJLElBQUksRUFBRSxDQUFDO1FBR2pDLFlBQU8sR0FBRyxLQUFLLENBQUM7UUFJaEIsU0FBSSxHQUFZLFNBQVMsQ0FBQztRQVkxQixhQUFRLEdBQVcsRUFBRSxDQUFDO1FBSXRCLGVBQVUsR0FBVyxZQUFZLENBQUM7UUFPM0IsWUFBTyxHQUFZLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFHMUMsZUFBVSxHQUF1QixTQUFTLENBQUM7UUFHM0MsYUFBUSxHQUFZLFNBQVMsQ0FBQztRQUc5QixjQUFTLEdBQVksU0FBUyxDQUFDO1FBRy9CLGFBQVEsR0FBYSxRQUFRLENBQUM7UUFHMUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUM7SUFDNUMsQ0FBQztJQUVELGVBQWUsQ0FBQyxjQUFzQixFQUFFLGVBQXVCOztRQUMzRCxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQUEsSUFBSSxDQUFDLFFBQVEsbUNBQUksUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sU0FBUyxHQUFHLE1BQUEsSUFBSSxDQUFDLFNBQVMsbUNBQUksZUFBZSxDQUFDO1FBQ3BELElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE9BQU87U0FDVjtRQUNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFKLElBQUksY0FBSixJQUFJLEdBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztJQUM3QixDQUFDOztBQTlEZSxlQUFPLEdBQUcsRUFBRSxDQUFDO0FBSzdCO0lBREMsUUFBUSxDQUFDLE9BQU8sQ0FBQzt3Q0FDRjtBQUloQjtJQUZDLFFBQVEsQ0FBQyxVQUFVLENBQUM7SUFDcEIsb0JBQW9CLENBQUMsTUFBTSxDQUFDO3FDQUNIO0FBSTFCO0lBRkMsUUFBUSxDQUFDLGNBQWMsQ0FBQztJQUN4QixvQkFBb0IsQ0FBQyxNQUFNLENBQUM7MENBQ0k7QUFJakM7SUFGQyxRQUFRLENBQUMsZUFBZSxDQUFDO0lBQ3pCLG9CQUFvQixDQUFDLE1BQU0sQ0FBQzsyQ0FDTTtBQUluQztJQUZDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkIsb0JBQW9CLENBQUMsTUFBTSxDQUFDO3lDQUNQO0FBSXRCO0lBRkMsUUFBUSxDQUFDLE1BQU0sQ0FBQztJQUNoQixvQkFBb0IsQ0FBQyxNQUFNLENBQUM7MkNBQ0s7QUFJbEM7SUFGQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7SUFDMUIsb0JBQW9CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztzQ0FDWDtBQUcxQjtJQURDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQ2tCO0FBRzFDO0lBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzsyQ0FDbUI7QUFHM0M7SUFEQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lDQUNNO0FBRzlCO0lBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzswQ0FDTztBQUcvQjtJQURDLFFBQVEsQ0FBQyxTQUFTLENBQUM7eUNBQ1UifQ==