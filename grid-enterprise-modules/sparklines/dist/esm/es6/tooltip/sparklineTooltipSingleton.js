var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, BeanStub, PostConstruct, PreDestroy } from '@ag-grid-community/core';
import { SparklineTooltip } from '../sparkline/tooltip/sparklineTooltip';
/**
 * This 'bean' creates a single sparkline tooltip that is bound to the grid lifecycle.
 */
let SparklineTooltipSingleton = class SparklineTooltipSingleton extends BeanStub {
    postConstruct() {
        this.tooltip = new SparklineTooltip();
    }
    getSparklineTooltip() {
        return this.tooltip;
    }
    destroyTooltip() {
        if (this.tooltip) {
            this.tooltip.destroy();
        }
    }
};
__decorate([
    PostConstruct
], SparklineTooltipSingleton.prototype, "postConstruct", null);
__decorate([
    PreDestroy
], SparklineTooltipSingleton.prototype, "destroyTooltip", null);
SparklineTooltipSingleton = __decorate([
    Bean('sparklineTooltipSingleton')
], SparklineTooltipSingleton);
export { SparklineTooltipSingleton };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhcmtsaW5lVG9vbHRpcFNpbmdsZXRvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90b29sdGlwL3NwYXJrbGluZVRvb2x0aXBTaW5nbGV0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3BGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRXpFOztHQUVHO0FBRUgsSUFBYSx5QkFBeUIsR0FBdEMsTUFBYSx5QkFBMEIsU0FBUSxRQUFRO0lBSTNDLGFBQWE7UUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVNLG1CQUFtQjtRQUN0QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUdPLGNBQWM7UUFDbEIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUMxQjtJQUNMLENBQUM7Q0FDSixDQUFBO0FBZEc7SUFEQyxhQUFhOzhEQUdiO0FBT0Q7SUFEQyxVQUFVOytEQUtWO0FBakJRLHlCQUF5QjtJQURyQyxJQUFJLENBQUMsMkJBQTJCLENBQUM7R0FDckIseUJBQXlCLENBa0JyQztTQWxCWSx5QkFBeUIifQ==