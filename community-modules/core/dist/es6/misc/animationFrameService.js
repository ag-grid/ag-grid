/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
import { Autowired, Bean, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { BeanStub } from "../context/beanStub";
var AnimationFrameService = /** @class */ (function (_super) {
    __extends(AnimationFrameService, _super);
    function AnimationFrameService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // p1 and p2 are create tasks are to do with row and cell creation.
        // for them we want to execute according to row order, so we use
        // TaskItem so we know what index the item is for.
        _this.createTasksP1 = { list: [], sorted: false }; // eg drawing back-ground of rows
        _this.createTasksP2 = { list: [], sorted: false }; // eg cell renderers, adding hover functionality
        // destroy tasks are to do with row removal. they are done after row creation as the user will need to see new
        // rows first (as blank is scrolled into view), when we remove the old rows (no longer in view) is not as
        // important.
        _this.destroyTasks = [];
        _this.ticking = false;
        // we need to know direction of scroll, to build up rows in the direction of
        // the scroll. eg if user scrolls down, we extend the rows by building down.
        _this.scrollGoingDown = true;
        _this.lastScrollTop = 0;
        _this.taskCount = 0;
        _this.cancelledTasks = new Set();
        return _this;
    }
    AnimationFrameService.prototype.setScrollTop = function (scrollTop) {
        this.scrollGoingDown = scrollTop > this.lastScrollTop;
        this.lastScrollTop = scrollTop;
    };
    AnimationFrameService.prototype.init = function () {
        this.useAnimationFrame = !this.gridOptionsWrapper.isSuppressAnimationFrame();
    };
    // this method is for our AG Grid sanity only - if animation frames are turned off,
    // then no place in the code should be looking to add any work to be done in animation
    // frames. this stops bugs - where some code is asking for a frame to be executed
    // when it should not.
    AnimationFrameService.prototype.verifyAnimationFrameOn = function (methodName) {
        if (this.useAnimationFrame === false) {
            console.warn("AG Grid: AnimationFrameService." + methodName + " called but animation frames are off");
        }
    };
    AnimationFrameService.prototype.createTask = function (task, index, list) {
        this.verifyAnimationFrameOn(list);
        var taskItem = { task: task, index: index, createOrder: ++this.taskCount };
        this.addTaskToList(this[list], taskItem);
        this.schedule();
    };
    AnimationFrameService.prototype.cancelTask = function (task) {
        this.cancelledTasks.add(task);
    };
    AnimationFrameService.prototype.addTaskToList = function (taskList, task) {
        taskList.list.push(task);
        taskList.sorted = false;
    };
    AnimationFrameService.prototype.sortTaskList = function (taskList) {
        if (taskList.sorted) {
            return;
        }
        var sortDirection = this.scrollGoingDown ? 1 : -1;
        // sort first by row index (taking into account scroll direction), then by
        // order of task creation (always ascending, so cells will render left-to-right)
        taskList.list.sort(function (a, b) { return a.index !== b.index ? sortDirection * (b.index - a.index) : b.createOrder - a.createOrder; });
        taskList.sorted = true;
    };
    AnimationFrameService.prototype.addDestroyTask = function (task) {
        this.verifyAnimationFrameOn('createTasksP3');
        this.destroyTasks.push(task);
        this.schedule();
    };
    AnimationFrameService.prototype.executeFrame = function (millis) {
        this.verifyAnimationFrameOn('executeFrame');
        var p1TaskList = this.createTasksP1;
        var p1Tasks = p1TaskList.list;
        var p2TaskList = this.createTasksP2;
        var p2Tasks = p2TaskList.list;
        var destroyTasks = this.destroyTasks;
        var frameStart = new Date().getTime();
        var duration = (new Date().getTime()) - frameStart;
        // 16ms is 60 fps
        var noMaxMillis = millis <= 0;
        var gridBodyCon = this.controllersService.getGridBodyController();
        while (noMaxMillis || duration < millis) {
            var gridBodyDidSomething = gridBodyCon.getScrollFeature().executeAnimationFrameScroll();
            if (!gridBodyDidSomething) {
                var task = void 0;
                if (p1Tasks.length) {
                    this.sortTaskList(p1TaskList);
                    task = p1Tasks.pop().task;
                }
                else if (p2Tasks.length) {
                    this.sortTaskList(p2TaskList);
                    task = p2Tasks.pop().task;
                }
                else if (destroyTasks.length) {
                    task = destroyTasks.pop();
                }
                else {
                    this.cancelledTasks.clear();
                    break;
                }
                if (!this.cancelledTasks.has(task)) {
                    task();
                }
            }
            duration = (new Date().getTime()) - frameStart;
        }
        if (p1Tasks.length || p2Tasks.length || destroyTasks.length) {
            this.requestFrame();
        }
        else {
            this.stopTicking();
        }
    };
    AnimationFrameService.prototype.stopTicking = function () {
        this.ticking = false;
        var event = {
            type: Events.EVENT_ANIMATION_QUEUE_EMPTY,
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
        return !this.ticking;
    };
    __decorate([
        Autowired('controllersService')
    ], AnimationFrameService.prototype, "controllersService", void 0);
    __decorate([
        PostConstruct
    ], AnimationFrameService.prototype, "init", null);
    AnimationFrameService = __decorate([
        Bean('animationFrameService')
    ], AnimationFrameService);
    return AnimationFrameService;
}(BeanStub));
export { AnimationFrameService };
