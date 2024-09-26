import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowGroupOpenedEvent } from '../events';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { AnimationFrameService } from '../misc/animationFrameService';

export class RowNodeEventThrottle extends BeanStub implements NamedBean {
    beanName = 'rowNodeEventThrottle' as const;

    private animationFrameService?: AnimationFrameService;
    private rowModel: IClientSideRowModel;

    public wireBeans(beans: BeanCollection): void {
        this.animationFrameService = beans.animationFrameService;
        this.rowModel = beans.rowModel as IClientSideRowModel;
    }

    private events: RowGroupOpenedEvent[] = [];

    private dispatchExpandedDebounced: () => void;

    // because the user can call rowNode.setExpanded() many times in one VM turn,
    // we throttle the calls to ClientSideRowModel using animationFrameService. this means for 100
    // row nodes getting expanded, we only update the CSRM once, and then we fire all events after
    // CSRM has updated.
    //
    // if we did not do this, then the user could call setExpanded on 100+ rows, causing the grid
    // to re-render 100+ times, which would be a performance lag.
    //
    // we use animationFrameService
    // rather than debounce() so this will get done if anyone flushes the animationFrameService
    // (eg user calls api.ensureRowVisible(), which in turn flushes ).
    public dispatchExpanded(event: RowGroupOpenedEvent, forceSync?: boolean): void {
        this.events.push(event);

        const func = () => {
            this.rowModel.onRowGroupOpened();
            this.events.forEach((e) => this.eventService.dispatchEvent(e));
            this.events = [];
        };

        if (forceSync) {
            func();
        } else {
            if (this.dispatchExpandedDebounced == null) {
                this.dispatchExpandedDebounced = this.debounce(func);
            }
            this.dispatchExpandedDebounced();
        }
    }

    // the advantage over normal debounce is the client can call flushAllFrames()
    // to make sure all rendering is complete. we don't wait any milliseconds,
    // as this is intended to batch calls in one VM turn.
    private debounce(func: () => void) {
        if (!this.animationFrameService) {
            return () => window.setTimeout(func, 0);
        }
        let pending = false;
        return () => {
            if (!this.animationFrameService!.isOn()) {
                window.setTimeout(func, 0);
                return;
            }
            if (pending) {
                return;
            }
            pending = true;
            this.animationFrameService!.addDestroyTask(() => {
                pending = false;
                func();
            });
        };
    }
}
