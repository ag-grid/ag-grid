/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowNodeEventThrottle = void 0;
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var RowNodeEventThrottle = /** @class */ (function (_super) {
    __extends(RowNodeEventThrottle, _super);
    function RowNodeEventThrottle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.events = [];
        return _this;
    }
    RowNodeEventThrottle.prototype.postConstruct = function () {
        if (this.rowModel.getType() == 'clientSide') {
            this.clientSideRowModel = this.rowModel;
        }
    };
    // because the user can call rowNode.setExpanded() many times in one VM turn,
    // we throttle the calls to ClientSideRowModel using animationFrameService. this means for 100
    // row nodes getting expanded, we only update the CSRM once, and then we fire all events after
    // CSRM has updated.
    //
    // if we did not do this, then the user could call setExpanded on 100+ rows, causing the grid
    // to re-render 100+ times, which would be a performance lag.
    //
    // we use animationFrameService
    // rather than _.debounce() so this will get done if anyone flushes the animationFrameService
    // (eg user calls api.ensureRowVisible(), which in turn flushes ).
    RowNodeEventThrottle.prototype.dispatchExpanded = function (event) {
        var _this = this;
        // if not using CSRM, we don't debounce. otherwise this breaks the SSRM.
        if (this.clientSideRowModel == null) {
            this.eventService.dispatchEvent(event);
            return;
        }
        this.events.push(event);
        var func = function () {
            if (_this.clientSideRowModel) {
                _this.clientSideRowModel.onRowGroupOpened();
            }
            _this.events.forEach(function (e) { return _this.eventService.dispatchEvent(e); });
            _this.events = [];
        };
        if (this.dispatchExpandedDebounced == null) {
            this.dispatchExpandedDebounced = this.animationFrameService.debounce(func);
        }
        this.dispatchExpandedDebounced();
    };
    __decorate([
        context_1.Autowired('animationFrameService')
    ], RowNodeEventThrottle.prototype, "animationFrameService", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], RowNodeEventThrottle.prototype, "rowModel", void 0);
    __decorate([
        context_1.PostConstruct
    ], RowNodeEventThrottle.prototype, "postConstruct", null);
    RowNodeEventThrottle = __decorate([
        context_1.Bean('rowNodeEventThrottle')
    ], RowNodeEventThrottle);
    return RowNodeEventThrottle;
}(beanStub_1.BeanStub));
exports.RowNodeEventThrottle = RowNodeEventThrottle;
