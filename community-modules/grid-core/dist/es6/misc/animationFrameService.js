/**
 * @ag-community/grid-core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
var AnimationFrameService = /** @class */ (function () {
    function AnimationFrameService() {
        // p1 and p2 are create tasks are to do with row and cell creation.
        // for them we want to execute according to row order, so we use
        // TaskItem so we know what index the item is for.
        this.createTasksP1 = []; // eg drawing back-ground of rows
        this.createTasksP2 = []; // eg cell renderers, adding hover functionality
        // destroy tasks are to do with row removal. they are done after row creation as the user will need to see new
        // rows first (as blank is scrolled into view), when we remove the old rows (no longer in view) is not as
        // important.
        this.destroyTasks = [];
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
    AnimationFrameService.prototype.addCreateP1Task = function (task, index) {
        this.verifyAnimationFrameOn('addP1Task');
        var taskItem = { task: task, index: index };
        this.createTasksP1.push(taskItem);
        this.schedule();
    };
    AnimationFrameService.prototype.addCreateP2Task = function (task, index) {
        this.verifyAnimationFrameOn('addP2Task');
        var taskItem = { task: task, index: index };
        this.createTasksP2.push(taskItem);
        this.schedule();
    };
    AnimationFrameService.prototype.addDestroyTask = function (task) {
        this.verifyAnimationFrameOn('addP3Task');
        this.destroyTasks.push(task);
        this.schedule();
    };
    AnimationFrameService.prototype.executeFrame = function (millis) {
        this.verifyAnimationFrameOn('executeFrame');
        // create a copy of p1Tasks, so that when addP1Task is called,
        // the new task is held until next frame so that it can be
        // sorted and executed in the right order. we don't do this for p2
        // tasks as p2 tasks are not ordered.
        var createP1TasksThisFrame = this.createTasksP1;
        var createP2TasksThisFrame = this.createTasksP2;
        var destroyTasksThisFrame = this.destroyTasks;
        this.createTasksP1 = [];
        this.createTasksP2 = [];
        this.destroyTasks = [];
        if (this.scrollGoingDown) {
            var ascSortFunc = function (a, b) { return b.index - a.index; };
            createP1TasksThisFrame.sort(ascSortFunc);
            createP2TasksThisFrame.sort(ascSortFunc);
        }
        else {
            var descSortFunc = function (a, b) { return a.index - b.index; };
            createP1TasksThisFrame.sort(descSortFunc);
            createP2TasksThisFrame.sort(descSortFunc);
        }
        var frameStart = new Date().getTime();
        var duration = (new Date().getTime()) - frameStart;
        // 16ms is 60 fps
        var noMaxMillis = millis <= 0;
        while (noMaxMillis || duration < millis) {
            var gridPanelUpdated = this.gridPanel.executeFrame();
            if (!gridPanelUpdated) {
                if (createP1TasksThisFrame.length > 0) {
                    var taskItem = createP1TasksThisFrame.pop();
                    taskItem.task();
                }
                else if (createP2TasksThisFrame.length > 0) {
                    var taskItem = createP2TasksThisFrame.pop();
                    taskItem.task();
                }
                else if (destroyTasksThisFrame.length > 0) {
                    var task = destroyTasksThisFrame.pop();
                    task();
                }
                else {
                    break;
                }
            }
            duration = (new Date().getTime()) - frameStart;
        }
        this.createTasksP1 = createP1TasksThisFrame.concat(this.createTasksP1);
        this.createTasksP2 = createP2TasksThisFrame.concat(this.createTasksP2);
        this.destroyTasks = destroyTasksThisFrame.concat(this.destroyTasks);
        if (this.createTasksP1.length > 0 || this.createTasksP2.length > 0 || this.destroyTasks.length > 0) {
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
        return this.ticking;
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], AnimationFrameService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('eventService')
    ], AnimationFrameService.prototype, "eventService", void 0);
    __decorate([
        PostConstruct
    ], AnimationFrameService.prototype, "init", null);
    AnimationFrameService = __decorate([
        Bean('animationFrameService')
    ], AnimationFrameService);
    return AnimationFrameService;
}());
export { AnimationFrameService };
