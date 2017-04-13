/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var utils_1 = require("../utils");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var columnController_1 = require("../columnController/columnController");
var ScrollVisibleService = (function () {
    function ScrollVisibleService() {
    }
    ScrollVisibleService.prototype.setScrollsVisible = function (params) {
        var atLeastOneDifferent = this.vBody !== params.vBody
            || this.hBody !== params.hBody
            || this.vPinnedLeft !== params.vPinnedLeft
            || this.vPinnedRight !== params.vPinnedRight;
        if (atLeastOneDifferent) {
            this.vBody = params.vBody;
            this.hBody = params.hBody;
            this.vPinnedLeft = params.vPinnedLeft;
            this.vPinnedRight = params.vPinnedRight;
            this.eventService.dispatchEvent(events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED);
        }
    };
    ScrollVisibleService.prototype.isVBodyShowing = function () {
        return this.vBody;
    };
    ScrollVisibleService.prototype.isHBodyShowing = function () {
        return this.hBody;
    };
    ScrollVisibleService.prototype.isVPinnedLeftShowing = function () {
        return this.vPinnedLeft;
    };
    ScrollVisibleService.prototype.isVPinnedRightShowing = function () {
        return this.vPinnedRight;
    };
    ScrollVisibleService.prototype.getPinnedLeftWidth = function () {
        return this.columnController.getPinnedLeftContainerWidth();
    };
    ScrollVisibleService.prototype.getPinnedLeftWithScrollWidth = function () {
        var result = this.getPinnedLeftWidth();
        if (this.vPinnedLeft) {
            result += utils_1.Utils.getScrollbarWidth();
        }
        return result;
    };
    ScrollVisibleService.prototype.getPinnedRightWidth = function () {
        return this.columnController.getPinnedRightContainerWidth();
    };
    ScrollVisibleService.prototype.getPinnedRightWithScrollWidth = function () {
        var result = this.getPinnedRightWidth();
        if (this.vPinnedRight) {
            result += utils_1.Utils.getScrollbarWidth();
        }
        return result;
    };
    return ScrollVisibleService;
}());
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], ScrollVisibleService.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], ScrollVisibleService.prototype, "columnController", void 0);
ScrollVisibleService = __decorate([
    context_1.Bean('scrollVisibleService')
], ScrollVisibleService);
exports.ScrollVisibleService = ScrollVisibleService;
