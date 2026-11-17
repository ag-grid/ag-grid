import { _requestAnimationFrame } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';

interface TaskItem {
    task: () => void;
    index: number;
    createOrder: number;
    deferred: boolean; // used for deferred tasks
}

interface TaskList {
    list: TaskItem[];
    sorted: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AnimationFrameService extends BeanStub implements NamedBean {
    beanName = 'animationFrameSvc' as const;

    // p1 and p2 are create tasks are to do with row and cell creation.
    // for them we want to execute according to row order, so we use
    // TaskItem so we know what index the item is for.
    private readonly p1: TaskList = { list: [], sorted: false }; // eg drawing back-ground of rows
    private readonly p2: TaskList = { list: [], sorted: false }; // eg cell renderers, adding hover functionality
    private readonly f1: TaskList = { list: [], sorted: false }; // eg framework cell renderers

    // destroy tasks are to do with row removal. they are done after row creation as the user will need to see new
    // rows first (as blank is scrolled into view), when we remove the old rows (no longer in view) is not as
    // important.
    private readonly destroyTasks: (() => void)[] = [];
    private ticking = false;
    /** Unset until postConstruct, so `verify` must not warn before then. */
    public active?: boolean;
    private batchFrameworkComps: boolean;

    // we need to know direction of scroll, to build up rows in the direction of
    // the scroll. eg if user scrolls down, we extend the rows by building down.
    private scrollGoingDown = true;
    private lastScrollTop = 0;

    private taskCount = 0;

    private readonly onFrame = (): void => {
        const { p1, p2, f1, destroyTasks } = this;
        // a task that throws leaves the tasks after it to the next frame, so drawing goes on
        try {
            this.runFrameTasks(60);
        } finally {
            if (p1.list.length || p2.list.length || f1.list.length || destroyTasks.length) {
                _requestAnimationFrame(this.beans, this.onFrame);
            } else {
                this.ticking = false;
            }
        }
    };

    public setScrollTop(scrollTop: number): void {
        this.scrollGoingDown = scrollTop >= this.lastScrollTop;

        if (scrollTop === 0) {
            // If we are at the top then we always want to be going down next.
            // This handles new pages for pagination and also row data being cleared.
            this.scrollGoingDown = true;
        }

        this.lastScrollTop = scrollTop;
    }

    public postConstruct(): void {
        this.active = !this.gos.get('suppressAnimationFrame');
        this.batchFrameworkComps = this.beans.frameworkOverrides.batchFrameworkComps;
    }

    // this method is for our AG Grid sanity only - if animation frames are turned off,
    // then no place in the code should be looking to add any work to be done in animation
    // frames. this stops bugs - where some code is asking for a frame to be executed
    // when it should not.
    private verify(): void {
        if (this.active === false) {
            this.warn(92);
        }
    }

    public createTask(
        task: () => void,
        index: number,
        list: 'p1' | 'p2',
        isFramework: boolean,
        isDeferred = false
    ): void {
        this.verify();
        let taskList: 'p1' | 'p2' | 'f1' = list;
        if (isFramework && this.batchFrameworkComps) {
            taskList = 'f1';
        }
        const taskItem: TaskItem = { task, index, createOrder: ++this.taskCount, deferred: isDeferred };
        this.addTaskToList(this[taskList], taskItem);
        this.schedule();
    }

    private addTaskToList(taskList: TaskList, task: TaskItem): void {
        taskList.list.push(task);
        taskList.sorted = false;
    }

    private sortTaskList(taskList: TaskList) {
        if (taskList.sorted) {
            return;
        }

        const sortDirection = this.scrollGoingDown ? 1 : -1;

        // Sort by:
        // 1. deferred last,
        // 2. then by row index (taking into account scroll direction),
        // 3. then by order of task creation (always ascending, so cells will render left-to-right)
        taskList.list.sort((a, b) => {
            if (a.deferred !== b.deferred) {
                return a.deferred ? -1 : 1; // deferred tasks always last
            }
            if (a.index !== b.index) {
                return sortDirection * (b.index - a.index);
            }
            return b.createOrder - a.createOrder;
        });
        taskList.sorted = true;
    }

    public addDestroyTask(task: () => void): void {
        this.verify();
        this.destroyTasks.push(task);
        this.schedule();
    }

    private runFrameTasks(millis: number): void {
        const { p1, p2, f1, destroyTasks, beans } = this;
        const { ctrlsSvc, frameworkOverrides } = beans;

        const p1Tasks = p1.list;
        const p2Tasks = p2.list;
        const f1Tasks = f1.list;

        const frameStart = Date.now();
        let duration = 0;

        // 16ms is 60 fps
        const noMaxMillis = millis <= 0;

        const scrollFeature = ctrlsSvc.getScrollFeature();

        while (noMaxMillis || duration < millis) {
            // scrollGridIfNeeded will cause tasks to be populated if scrolling was done and may have taken time
            // to do so. This is why we need to check if we have time left after scrolling before performing any tasks.
            const gridBodyDidSomething = scrollFeature.scrollGridIfNeeded();

            if (!gridBodyDidSomething) {
                if (p1Tasks.length) {
                    this.sortTaskList(p1);
                    p1Tasks.pop()!.task();
                } else if (p2Tasks.length) {
                    this.sortTaskList(p2);
                    p2Tasks.pop()!.task();
                } else if (f1Tasks.length) {
                    // Assuming that framework tasks do not schedule p1 or p2 tasks so that it is safe
                    // to loop through all framework tasks for as long as we have time left
                    frameworkOverrides.wrapOutgoing(() => {
                        while (noMaxMillis || duration < millis) {
                            const gridBodyDidSomething = scrollFeature.scrollGridIfNeeded();

                            if (!gridBodyDidSomething) {
                                if (f1Tasks.length) {
                                    this.sortTaskList(f1);
                                    f1Tasks.pop()!.task();
                                } else {
                                    break;
                                }
                            } else {
                                // If the grid body did something, we need to break out of the framework loop as p1 and p2 tasks may have been scheduled.
                                break;
                            }
                            duration = Date.now() - frameStart;
                        }
                    });
                } else if (destroyTasks.length) {
                    destroyTasks.pop()!();
                } else {
                    break;
                }
            }

            duration = Date.now() - frameStart;
        }
    }

    public flushAllFrames(): void {
        if (!this.active) {
            return;
        }
        this.runFrameTasks(-1);
        this.ticking = false;
    }

    public schedule(): void {
        if (!this.active) {
            return;
        }
        if (!this.ticking) {
            this.ticking = true;
            _requestAnimationFrame(this.beans, this.onFrame);
        }
    }

    public isQueueEmpty(): boolean {
        return !this.ticking;
    }
}
