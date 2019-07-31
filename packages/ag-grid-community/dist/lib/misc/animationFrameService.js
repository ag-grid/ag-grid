/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var eventKeys_1 = require("../eventKeys");
var eventService_1 = require("../eventService");
var AnimationFrameService = /** @class */ (function () {
    function AnimationFrameService() {
        // create tasks are to do with row creation. for them we want to execute according to row order, so we use
        // TaskItem so we know what index the item is for.
        this.p1Tasks = [];
        // destroy tasks are to do with row removal. they are done after row creation as the user will need to see new
        // rows first (as blank is scrolled into view), when we remove the old rows (no longer in view) is not as
        // important.
        this.p2Tasks = [];
        this.ticking = false;
        // we need to know direction of scroll, to build up rows in the direction of
        // the scroll. eg if user scrolls down, we extend the rows by building down.
        this.scrollGoingDown = true;
        this.lastScrollTop = 0;
    }
    AnimationFrameService.prototype.setScrollTop = function (scrollTop) {
        this.scrollGoingDown = scrollTop > this.lastScrollTop;
        this.lastScrollTop = scrollTop;
    };
    AnimationFrameService.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    AnimationFrameService.prototype.init = function () {
        this.useAnimationFrame = !this.gridOptionsWrapper.isSuppressAnimationFrame();
    };
    // this method is for our ag-Grid sanity only - if animation frames are turned off,
    // then no place in the code should be looking to add any work to be done in animation
    // frames. this stops bugs - where some code is asking for a frame to be executed
    // when it should not.
    AnimationFrameService.prototype.verifyAnimationFrameOn = function (methodName) {
        if (this.useAnimationFrame === false) {
            console.warn("ag-Grid: AnimationFrameService." + methodName + " called but animation frames are off");
        }
    };
    AnimationFrameService.prototype.addP1Task = function (task, index) {
        this.verifyAnimationFrameOn('addP1Task');
        var taskItem = { task: task, index: index };
        this.p1Tasks.push(taskItem);
        this.schedule();
    };
    AnimationFrameService.prototype.addP2Task = function (task) {
        this.verifyAnimationFrameOn('addP2Task');
        this.p2Tasks.push(task);
        this.schedule();
    };
    AnimationFrameService.prototype.executeFrame = function (millis) {
        this.verifyAnimationFrameOn('executeFrame');
        if (this.scrollGoingDown) {
            this.p1Tasks.sort(function (a, b) { return b.index - a.index; });
        }
        else {
            this.p1Tasks.sort(function (a, b) { return a.index - b.index; });
        }
        var frameStart = new Date().getTime();
        var duration = (new Date().getTime()) - frameStart;
        // 16ms is 60 fps
        var noMaxMillis = millis <= 0;
        while (noMaxMillis || duration < millis) {
            var gridPanelUpdated = this.gridPanel.executeFrame();
            if (!gridPanelUpdated) {
                if (this.p1Tasks.length > 0) {
                    var taskItem = this.p1Tasks.pop();
                    taskItem.task();
                }
                else if (this.p2Tasks.length > 0) {
                    var task = this.p2Tasks.pop();
                    task();
                }
                else {
                    break;
                }
            }
            duration = (new Date().getTime()) - frameStart;
        }
        if (this.p1Tasks.length > 0 || this.p2Tasks.length > 0) {
            this.requestFrame();
        }
        else {
            this.stopTicking();
        }
    };
    AnimationFrameService.prototype.stopTicking = function () {
        this.ticking = false;
        var event = {
            type: eventKeys_1.Events.EVENT_ANIMATION_QUEUE_EMPTY,
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            api: this.gridOptionsWrapper.getApi()
        };
        this.eventService.dispatchEvent(event);
    };
    AnimationFrameService.prototype.flushAllFrames = function () {
        if (!this.useAnimationFrame) {
            return;
        }
        this.executeFrame(-1);
    };
    AnimationFrameService.prototype.schedule = function () {
        if (!this.useAnimationFrame) {
            return;
        }
        if (!this.ticking) {
            this.ticking = true;
            this.requestFrame();
        }
    };
    AnimationFrameService.prototype.requestFrame = function () {
        // check for the existence of requestAnimationFrame, and if
        // it's missing, then we polyfill it with setTimeout()
        var callback = this.executeFrame.bind(this, 60);
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(callback);
        }
        else if (window.webkitRequestAnimationFrame) {
            window.webkitRequestAnimationFrame(callback);
        }
        else {
            window.setTimeout(callback, 0);
        }
    };
    AnimationFrameService.prototype.isQueueEmpty = function () {
        return this.ticking;
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], AnimationFrameService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], AnimationFrameService.prototype, "eventService", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AnimationFrameService.prototype, "init", null);
    AnimationFrameService = __decorate([
        context_1.Bean('animationFrameService')
    ], AnimationFrameService);
    return AnimationFrameService;
}());
exports.AnimationFrameService = AnimationFrameService;
