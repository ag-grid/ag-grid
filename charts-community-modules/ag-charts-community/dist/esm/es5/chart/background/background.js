var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Rect } from '../../scene/shape/rect';
import { Group } from '../../scene/group';
import { BaseModuleInstance } from '../../util/module';
import { ProxyPropertyOnWrite } from '../../util/proxy';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../../util/validation';
import { Layers } from '../layers';
var Background = /** @class */ (function (_super) {
    __extends(Background, _super);
    function Background(ctx) {
        var _a;
        var _this = _super.call(this) || this;
        _this.onLayoutComplete = function (e) {
            var _a = e.chart, width = _a.width, height = _a.height;
            _this.rectNode.width = width;
            _this.rectNode.height = height;
        };
        _this.node = new Group({ name: 'background' });
        _this.node.zIndex = Layers.SERIES_BACKGROUND_ZINDEX;
        _this.rectNode = new Rect();
        _this.node.appendChild(_this.rectNode);
        _this.fill = 'white';
        _this.visible = true;
        (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(_this.node);
        _this.destroyFns.push(function () { var _a; return (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(_this.node); });
        var layoutHandle = ctx.layoutService.addListener('layout-complete', _this.onLayoutComplete);
        _this.destroyFns.push(function () { return ctx.layoutService.removeListener(layoutHandle); });
        return _this;
    }
    __decorate([
        Validate(BOOLEAN),
        ProxyPropertyOnWrite('node', 'visible')
    ], Background.prototype, "visible", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING),
        ProxyPropertyOnWrite('rectNode', 'fill')
    ], Background.prototype, "fill", void 0);
    return Background;
}(BaseModuleInstance));
export { Background };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9iYWNrZ3JvdW5kL2JhY2tncm91bmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzlDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsa0JBQWtCLEVBQWlDLE1BQU0sbUJBQW1CLENBQUM7QUFDdEYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDeEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUU1RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRW5DO0lBQWdDLDhCQUFrQjtJQUk5QyxvQkFBWSxHQUFrQjs7UUFBOUIsWUFDSSxpQkFBTyxTQWNWO1FBVU8sc0JBQWdCLEdBQUcsVUFBQyxDQUFzQjtZQUN4QyxJQUFBLEtBQW9CLENBQUMsQ0FBQyxLQUFLLEVBQXpCLEtBQUssV0FBQSxFQUFFLE1BQU0sWUFBWSxDQUFDO1lBQ2xDLEtBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUM1QixLQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDbEMsQ0FBQyxDQUFDO1FBMUJFLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUM5QyxLQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsd0JBQXdCLENBQUM7UUFDbkQsS0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzNCLEtBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyQyxLQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUNwQixLQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUVwQixNQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSwwQ0FBRSxXQUFXLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLHNCQUFNLE9BQUEsTUFBQSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksMENBQUUsV0FBVyxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxFQUFBLENBQUMsQ0FBQztRQUVuRSxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM3RixLQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFNLE9BQUEsR0FBRyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQTlDLENBQThDLENBQUMsQ0FBQzs7SUFDL0UsQ0FBQztJQUlEO1FBRkMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUNqQixvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDOytDQUN2QjtJQUlqQjtRQUZDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztRQUMxQixvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDOzRDQUNoQjtJQU83QixpQkFBQztDQUFBLEFBbENELENBQWdDLGtCQUFrQixHQWtDakQ7U0FsQ1ksVUFBVSJ9