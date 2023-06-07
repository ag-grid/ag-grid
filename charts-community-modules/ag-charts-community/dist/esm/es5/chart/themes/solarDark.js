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
import { DarkTheme } from './darkTheme';
var palette = {
    fills: [
        '#febe76',
        '#ff7979',
        '#badc58',
        '#f9ca23',
        '#f0932b',
        '#eb4c4b',
        '#6ab04c',
        '#7ed6df',
        '#e056fd',
        '#686de0',
    ],
    strokes: [
        '#b28553',
        '#b35555',
        '#829a3e',
        '#ae8d19',
        '#a8671e',
        '#a43535',
        '#4a7b35',
        '#58969c',
        '#9d3cb1',
        '#494c9d',
    ],
};
var SolarDark = /** @class */ (function (_super) {
    __extends(SolarDark, _super);
    function SolarDark() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SolarDark.prototype.getPalette = function () {
        return palette;
    };
    return SolarDark;
}(DarkTheme));
export { SolarDark };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29sYXJEYXJrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3RoZW1lcy9zb2xhckRhcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUd4QyxJQUFNLE9BQU8sR0FBd0I7SUFDakMsS0FBSyxFQUFFO1FBQ0gsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztLQUNaO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztLQUNaO0NBQ0osQ0FBQztBQUVGO0lBQStCLDZCQUFTO0lBQXhDOztJQUlBLENBQUM7SUFIYSw4QkFBVSxHQUFwQjtRQUNJLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFDTCxnQkFBQztBQUFELENBQUMsQUFKRCxDQUErQixTQUFTLEdBSXZDIn0=