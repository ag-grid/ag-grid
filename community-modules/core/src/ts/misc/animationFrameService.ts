
import { Bean, PostConstruct } from "../context/context";
import { AnimationQueueEmptyEvent } from "../events";
import { Events } from "../eventKeys";
import { BeanStub } from "../context/beanStub";
import { GridPanel } from "../gridPanel/gridPanel";
import {LinkedList} from "./linkedList";

enum Direction { Up, Down};

interface TaskRow {
    rowIndex: number;
    tasks: LinkedList<() => void>;
}

class TaskBag {

    private taskRows: TaskRow[] = [];
    private mapToTaskRows: {[rowIndex: number]: TaskRow} = {};

    private sorted = false;

    public add(task: () => void, rowIndex: number): void {
        let taskRow = this.mapToTaskRows[rowIndex];
        if (taskRow==null) {
            taskRow = {rowIndex, tasks: new LinkedList<() => void>()};
            this.mapToTaskRows[rowIndex] = taskRow;
            this.taskRows.push(taskRow)
            this.sorted = false;
        }
        taskRow.tasks.add(task);
    }

    public ensureSorted(): void {
        if (this.sorted) { return; }

        this.taskRows.sort( (a: TaskRow, b: TaskRow) => {
            return a.rowIndex - b.rowIndex;
        });

        this.sorted = true;
    }

    public pullTask(direction: Direction): ()=>void {
        this.ensureSorted();

        // if doing down, use first row index, if going up use last row index
        const indexOfTask = direction == Direction.Down ? 0 : this.taskRows.length - 1;

        const tasksForRow = this.taskRows[indexOfTask];
        const res = tasksForRow.tasks.remove();

        if (tasksForRow.tasks.isEmpty()) {
            delete this.mapToTaskRows[tasksForRow.rowIndex];
            this.taskRows.splice(indexOfTask, 1);
        }

        return res;
    }

    public isEmpty(): boolean {
        return this.taskRows.length == 0;
    }
}

@Bean('animationFrameService')
export class AnimationFrameService extends BeanStub {

    // p1 and p2 are create tasks are to do with row and cell creation.
    // for them we want to execute according to row order, so we use
    // TaskItem so we know what index the item is for.
    private createTasksP1: TaskBag = new TaskBag(); // eg drawing back-ground of rows
    private createTasksP2: TaskBag = new TaskBag(); // eg cell renderers, adding hover functionality

    // destroy tasks are to do with row removal. they are done after row creation as the user will need to see new
    // rows first (as blank is scrolled into view), when we remove the old rows (no longer in view) is not as
    // important.
    private destroyTasks: (() => void)[] = [];
    private ticking = false;
    private useAnimationFrame: boolean;

    // we need to know direction of scroll, to build up rows in the direction of
    // the scroll. eg if user scrolls down, we extend the rows by building down.
    private scrollGoingDown = true;
    private lastScrollTop = 0;

    private cancelledTasks = new Set();

    private gridPanel: GridPanel;

    public setScrollTop(scrollTop: number): void {
        this.scrollGoingDown = scrollTop > this.lastScrollTop;
        this.lastScrollTop = scrollTop;
    }

    @PostConstruct
    private init(): void {
        this.useAnimationFrame = !this.gridOptionsWrapper.isSuppressAnimationFrame();
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    // this method is for our AG Grid sanity only - if animation frames are turned off,
    // then no place in the code should be looking to add any work to be done in animation
    // frames. this stops bugs - where some code is asking for a frame to be executed
    // when it should not.
    private verifyAnimationFrameOn(methodName: string): void {
        if (this.useAnimationFrame === false) {
            console.warn(`AG Grid: AnimationFrameService.${methodName} called but animation frames are off`);
        }
    }

    public createTask(task: () => void, index: number, list: 'createTasksP1' | 'createTasksP2') {
        this.verifyAnimationFrameOn(list);
        if (list=="createTasksP1") {
            this.createTasksP1.add(task, index);
        } else {
            this.createTasksP2.add(task, index);
        }
        this.schedule();
    }

    public cancelTask(task: () => void) {
        this.cancelledTasks.add(task);
    }

    public addDestroyTask(task: () => void): void {
        this.verifyAnimationFrameOn('createTasksP3');
        this.destroyTasks.push(task);
        this.schedule();
    }

    private executeFrame(millis: number): void {
        this.verifyAnimationFrameOn('executeFrame');

        const frameStart = new Date().getTime();
        let duration = 0;

        // 16ms is 60 fps
        const noMaxMillis = millis <= 0;

        const direction = this.scrollGoingDown ? Direction.Down : Direction.Up;

        while (noMaxMillis || duration < millis) {
            if (!this.gridPanel.executeAnimationFrameScroll()) {
                let task: () => void;
                if (!this.createTasksP1.isEmpty()) {
                    task = this.createTasksP1.pullTask(direction);
                } else if (!this.createTasksP2.isEmpty()) {
                    task = this.createTasksP2.pullTask(direction);
                } else if (this.destroyTasks.length) {
                    task = this.destroyTasks.pop()!;
                } else {
                    this.cancelledTasks.clear();
                    break;
                }

                if (!this.cancelledTasks.has(task)) {
                    task();
                }
            }

            duration = (new Date().getTime()) - frameStart;
        }

        const p1sExist = !this.createTasksP1.isEmpty();
        const p2sExist = !this.createTasksP2.isEmpty();
        const removesExist = this.destroyTasks.length>0;

        if (p1sExist || p2sExist || removesExist) {
            this.requestFrame();
        } else {
            this.stopTicking();
        }
    }

    private stopTicking(): void {
        this.ticking = false;
        const event: AnimationQueueEmptyEvent = {
            type: Events.EVENT_ANIMATION_QUEUE_EMPTY,
            columnApi: this.gridOptionsWrapper.getColumnApi()!,
            api: this.gridOptionsWrapper.getApi()!
        };
        this.eventService.dispatchEvent(event);
    }

    public flushAllFrames(): void {
        if (!this.useAnimationFrame) { return; }
        this.executeFrame(-1);
    }

    public schedule(): void {
        if (!this.useAnimationFrame) { return; }
        if (!this.ticking) {
            this.ticking = true;
            this.requestFrame();
        }
    }

    private requestFrame(): void {
        // check for the existence of requestAnimationFrame, and if
        // it's missing, then we polyfill it with setTimeout()
        const callback = this.executeFrame.bind(this, 60);
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(callback);
        } else if (window.webkitRequestAnimationFrame) {
            window.webkitRequestAnimationFrame(callback);
        } else {
            window.setTimeout(callback, 0);
        }
    }

    public isQueueEmpty(): boolean {
        return !this.ticking;
    }

}
