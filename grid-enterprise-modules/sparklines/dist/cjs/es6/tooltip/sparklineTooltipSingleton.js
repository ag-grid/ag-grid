"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparklineTooltipSingleton = void 0;
const core_1 = require("@ag-grid-community/core");
const sparklineTooltip_1 = require("../sparkline/tooltip/sparklineTooltip");
/**
 * This 'bean' creates a single sparkline tooltip that is bound to the grid lifecycle.
 */
let SparklineTooltipSingleton = class SparklineTooltipSingleton extends core_1.BeanStub {
    postConstruct() {
        this.tooltip = new sparklineTooltip_1.SparklineTooltip();
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
    core_1.PostConstruct
], SparklineTooltipSingleton.prototype, "postConstruct", null);
__decorate([
    core_1.PreDestroy
], SparklineTooltipSingleton.prototype, "destroyTooltip", null);
SparklineTooltipSingleton = __decorate([
    core_1.Bean('sparklineTooltipSingleton')
], SparklineTooltipSingleton);
exports.SparklineTooltipSingleton = SparklineTooltipSingleton;
