var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { OPT_FUNCTION, OPT_STRING, Validate } from '../../util/validation';
var Overlay = /** @class */ (function () {
    function Overlay(className, parent) {
        this.renderer = undefined;
        this.text = undefined;
        this.className = className;
        this.parentElement = parent;
    }
    Overlay.prototype.show = function (rect) {
        var _a, _b;
        var element = this.element;
        if (!this.element) {
            element = document.createElement('div');
            element.className = this.className;
            this.element = element;
        }
        element.style.position = 'absolute';
        element.style.left = rect.x + "px";
        element.style.top = rect.y + "px";
        element.style.width = rect.width + "px";
        element.style.height = rect.height + "px";
        if (this.renderer) {
            this.element.innerHTML = this.renderer();
        }
        else {
            var content = document.createElement('div');
            content.style.alignItems = 'center';
            content.style.boxSizing = 'border-box';
            content.style.display = 'flex';
            content.style.justifyContent = 'center';
            content.style.margin = '8px';
            content.style.height = '100%';
            content.style.font = '12px Verdana, sans-serif';
            content.innerText = (_a = this.text) !== null && _a !== void 0 ? _a : 'No data to display';
            element.append(content);
        }
        (_b = this.parentElement) === null || _b === void 0 ? void 0 : _b.append(element);
    };
    Overlay.prototype.hide = function () {
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.remove();
        this.element = undefined;
    };
    __decorate([
        Validate(OPT_FUNCTION)
    ], Overlay.prototype, "renderer", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], Overlay.prototype, "text", void 0);
    return Overlay;
}());
export { Overlay };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9vdmVybGF5L292ZXJsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFHM0U7SUFDSSxpQkFBWSxTQUFpQixFQUFFLE1BQW1CO1FBTWxELGFBQVEsR0FBK0IsU0FBUyxDQUFDO1FBR2pELFNBQUksR0FBWSxTQUFTLENBQUM7UUFSdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7SUFDaEMsQ0FBQztJQVlELHNCQUFJLEdBQUosVUFBSyxJQUFVOztRQUNYLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFRLENBQUM7UUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZixPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7U0FDMUI7UUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDcEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQU0sSUFBSSxDQUFDLENBQUMsT0FBSSxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFNLElBQUksQ0FBQyxDQUFDLE9BQUksQ0FBQztRQUNsQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBTSxJQUFJLENBQUMsS0FBSyxPQUFJLENBQUM7UUFDeEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQU0sSUFBSSxDQUFDLE1BQU0sT0FBSSxDQUFDO1FBRTFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM1QzthQUFNO1lBQ0gsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7WUFDcEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO1lBQ3ZDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7WUFDeEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRywwQkFBMEIsQ0FBQztZQUNoRCxPQUFPLENBQUMsU0FBUyxHQUFHLE1BQUEsSUFBSSxDQUFDLElBQUksbUNBQUksb0JBQW9CLENBQUM7WUFFdEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMzQjtRQUVELE1BQUEsSUFBSSxDQUFDLGFBQWEsMENBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxzQkFBSSxHQUFKOztRQUNJLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsTUFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7SUFDN0IsQ0FBQztJQTdDRDtRQURDLFFBQVEsQ0FBQyxZQUFZLENBQUM7NkNBQzBCO0lBR2pEO1FBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQzt5Q0FDSztJQTJDOUIsY0FBQztDQUFBLEFBckRELElBcURDO1NBckRZLE9BQU8ifQ==