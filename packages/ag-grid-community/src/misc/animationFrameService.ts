import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { _getWindow } from '../gridOptionsUtils';
import { _warn } from '../validation/logging';

interface TaskItem {
    task: () => void;
    index: number;
    createOrder: number;
}

interface TaskList {
    list: TaskItem[];
    sorted: boolean;
}

export function _requestAnimationFrame(beans: BeanCollection, callback: any) {
    const win = _getWindow(beans);

    if (win.requestAnimationFrame) {
        win.requestAnimationFrame(callback);
    } else if ((win as any).webkitRequestAnimationFrame) {
        (win as any).webkitRequestAnimationFrame(callback);
    } else {
        win.setTimeout(callback, 0);
    }
}

export class AnimationFrameService extends BeanStub implements NamedBean {
    beanName = 'animationFrameSvc' as const;

    // p1 and p2 are create tasks are to do with row and cell creation.
    // for them we want to execute according to row order, so we use
    // TaskItem so we know what index the item is for.
    private p1: TaskList = { list: [], sorted: false }; // eg drawing back-ground of rows
    private p2: TaskList = { list: [], sorted: false }; // eg cell renderers, adding hover functionality
    private f1: TaskList = { list: [], sorted: false }; // eg framework cell renderers

    // destroy tasks are to do with row removal. they are done after row creation as the user will need to see new
    // rows first (as blank is scrolled into view), when we remove the old rows (no longer in view) is not as
    // important.
    private destroyTasks: (() => void)[] = [];
    private ticking = false;
    public active: boolean;
    private batchFrameworkComponents: boolean;

    // we need to know direction of scroll, to build up rows in the direction of
    // the scroll. eg if user scrolls down, we extend the rows by building down.
    private scrollGoingDown = true;
    private lastPage = 0;
    private lastScrollTop = 0;

    private taskCount = 0;

    public setScrollTop(scrollTop: number): void {
        const { gos, pagination } = this.beans;
        const isPaginationActive = gos.get('pagination');
        this.scrollGoingDown = scrollTop >= this.lastScrollTop;

        if (isPaginationActive && scrollTop === 0) {
            const currentPage = pagination?.getCurrentPage() ?? 0;
            if (currentPage !== this.lastPage) {
                this.lastPage = currentPage;
                this.scrollGoingDown = true;
            }
        }

        this.lastScrollTop = scrollTop;
    }

    public postConstruct(): void {
        this.active = !this.gos.get('suppressAnimationFrame');
        this.batchFrameworkComponents = this.beans.frameworkOverrides.batchFrameworkComponents;
    }

    // this method is for our AG Grid sanity only - if animation frames are turned off,
    // then no place in the code should be looking to add any work to be done in animation
    // frames. this stops bugs - where some code is asking for a frame to be executed
    // when it should not.
    private verify(): void {
        if (this.active === false) {
            _warn(92);
        }
    }

    public createTask(task: () => void, index: number, list: 'p1' | 'p2', isFramework: boolean) {
        this.verify();
        let taskList: 'p1' | 'p2' | 'f1' = list;
        if (isFramework && this.batchFrameworkComponents) {
            taskList = 'f1';
        }
        const taskItem: TaskItem = { task, index, createOrder: ++this.taskCount };
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

        // sort first by row index (taking into account scroll direction), then by
        // order of task creation (always ascending, so cells will render left-to-right)
        taskList.list.sort((a, b) =>
            a.index !== b.index ? sortDirection * (b.index - a.index) : b.createOrder - a.createOrder
        );
        taskList.sorted = true;
    }

    public addDestroyTask(task: () => void): void {
        this.verify();
        this.destroyTasks.push(task);
        this.schedule();
    }

    private executeFrame(millis: number): void {
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
                let task: () => void;
                if (p1Tasks.length) {
                    this.sortTaskList(p1);
                    task = p1Tasks.pop()!.task;
                } else if (p2Tasks.length) {
                    this.sortTaskList(p2);
                    task = p2Tasks.pop()!.task;
                } else if (f1Tasks.length) {
                    // Assuming that framework tasks do not schedule p1 or p2 tasks so that it is safe
                    // to loop through all framework tasks for as long as we have time left
                    frameworkOverrides.wrapOutgoing(() => {
                        while (noMaxMillis || duration < millis) {
                            const gridBodyDidSomething = scrollFeature.scrollGridIfNeeded();

                            if (!gridBodyDidSomething) {
                                if (f1Tasks.length) {
                                    this.sortTaskList(f1);
                                    task = f1Tasks.pop()!.task;
                                    task();
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

                    // Empty task to avoid needing to check if task is defined in other path.
                    task = () => {};
                } else if (destroyTasks.length) {
                    task = destroyTasks.pop()!;
                } else {
                    break;
                }

                task();
            }

            duration = Date.now() - frameStart;
        }

        if (p1Tasks.length || p2Tasks.length || f1Tasks.length || destroyTasks.length) {
            this.requestFrame();
        } else {
            this.ticking = false;
        }
    }

    public flushAllFrames(): void {
        if (!this.active) {
            return;
        }
        this.executeFrame(-1);
    }

    public schedule(): void {
        if (!this.active) {
            return;
        }
        if (!this.ticking) {
            this.ticking = true;
            this.requestFrame();
        }
    }

    private requestFrame(): void {
        // check for the existence of requestAnimationFrame, and if
        // it's missing, then we polyfill it with setTimeout()
        const callback = this.executeFrame.bind(this, 60);
        _requestAnimationFrame(this.beans, callback);
    }

    public isQueueEmpty(): boolean {
        return !this.ticking;
    }
}
