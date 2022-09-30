/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
let AnimationFrameService = class AnimationFrameService extends BeanStub {
    constructor() {
        super(...arguments);
        // p1 and p2 are create tasks are to do with row and cell creation.
        // for them we want to execute according to row order, so we use
        // TaskItem so we know what index the item is for.
        this.createTasksP1 = { list: [], sorted: false }; // eg drawing back-ground of rows
        this.createTasksP2 = { list: [], sorted: false }; // eg cell renderers, adding hover functionality
        // destroy tasks are to do with row removal. they are done after row creation as the user will need to see new
        // rows first (as blank is scrolled into view), when we remove the old rows (no longer in view) is not as
        // important.
        this.destroyTasks = [];
        this.ticking = false;
        // we need to know direction of scroll, to build up rows in the direction of
        // the scroll. eg if user scrolls down, we extend the rows by building down.
        this.scrollGoingDown = true;
        this.lastScrollTop = 0;
        this.taskCount = 0;
        this.cancelledTasks = new Set();
    }
    setScrollTop(scrollTop) {
        this.scrollGoingDown = scrollTop > this.lastScrollTop;
        this.lastScrollTop = scrollTop;
    }
    init() {
        this.useAnimationFrame = !this.gridOptionsWrapper.isSuppressAnimationFrame();
    }
    isOn() {
        return this.useAnimationFrame;
    }
    // this method is for our AG Grid sanity only - if animation frames are turned off,
    // then no place in the code should be looking to add any work to be done in animation
    // frames. this stops bugs - where some code is asking for a frame to be executed
    // when it should not.
    verifyAnimationFrameOn(methodName) {
        if (this.useAnimationFrame === false) {
            console.warn(`AG Grid: AnimationFrameService.${methodName} called but animation frames are off`);
        }
    }
    createTask(task, index, list) {
        this.verifyAnimationFrameOn(list);
        const taskItem = { task, index, createOrder: ++this.taskCount };
        this.addTaskToList(this[list], taskItem);
        this.schedule();
    }
    cancelTask(task) {
        this.cancelledTasks.add(task);
    }
    addTaskToList(taskList, task) {
        taskList.list.push(task);
        taskList.sorted = false;
    }
    sortTaskList(taskList) {
        if (taskList.sorted) {
            return;
        }
        const sortDirection = this.scrollGoingDown ? 1 : -1;
        // sort first by row index (taking into account scroll direction), then by
        // order of task creation (always ascending, so cells will render left-to-right)
        taskList.list.sort((a, b) => a.index !== b.index ? sortDirection * (b.index - a.index) : b.createOrder - a.createOrder);
        taskList.sorted = true;
    }
    addDestroyTask(task) {
        this.verifyAnimationFrameOn('createTasksP3');
        this.destroyTasks.push(task);
        this.schedule();
    }
    executeFrame(millis) {
        this.verifyAnimationFrameOn('executeFrame');
        const p1TaskList = this.createTasksP1;
        const p1Tasks = p1TaskList.list;
        const p2TaskList = this.createTasksP2;
        const p2Tasks = p2TaskList.list;
        const destroyTasks = this.destroyTasks;
        const frameStart = new Date().getTime();
        let duration = (new Date().getTime()) - frameStart;
        // 16ms is 60 fps
        const noMaxMillis = millis <= 0;
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        while (noMaxMillis || duration < millis) {
            const gridBodyDidSomething = gridBodyCon.getScrollFeature().executeAnimationFrameScroll();
            if (!gridBodyDidSomething) {
                let task;
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
    }
    stopTicking() {
        this.ticking = false;
    }
    flushAllFrames() {
        if (!this.useAnimationFrame) {
            return;
        }
        this.executeFrame(-1);
    }
    schedule() {
        if (!this.useAnimationFrame) {
            return;
        }
        if (!this.ticking) {
            this.ticking = true;
            this.requestFrame();
        }
    }
    requestFrame() {
        // check for the existence of requestAnimationFrame, and if
        // it's missing, then we polyfill it with setTimeout()
        const callback = this.executeFrame.bind(this, 60);
        const eDocument = this.gridOptionsWrapper.getDocument();
        const win = (eDocument.defaultView || window);
        if (win.requestAnimationFrame) {
            win.requestAnimationFrame(callback);
        }
        else if (win.webkitRequestAnimationFrame) {
            win.webkitRequestAnimationFrame(callback);
        }
        else {
            win.setTimeout(callback, 0);
        }
    }
    isQueueEmpty() {
        return !this.ticking;
    }
    // a debounce utility used for parts of the app involved with rendering.
    // the advantage over normal debounce is the client can call flushAllFrames()
    // to make sure all rendering is complete. we don't wait any milliseconds,
    // as this is intended to batch calls in one VM turn.
    debounce(func) {
        let pending = false;
        return () => {
            if (!this.isOn()) {
                this.getFrameworkOverrides().setTimeout(func, 0);
                return;
            }
            if (pending) {
                return;
            }
            pending = true;
            this.addDestroyTask(() => {
                pending = false;
                func();
            });
        };
    }
};
__decorate([
    Autowired('ctrlsService')
], AnimationFrameService.prototype, "ctrlsService", void 0);
__decorate([
    PostConstruct
], AnimationFrameService.prototype, "init", null);
AnimationFrameService = __decorate([
    Bean('animationFrameService')
], AnimationFrameService);
export { AnimationFrameService };
