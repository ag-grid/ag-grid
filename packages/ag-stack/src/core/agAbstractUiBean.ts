import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { AgUiBean } from '../interfaces/agUiBean';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { AgEventService } from '../interfaces/iEvent';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _requestAnimationFrame } from '../utils/dom';
import { _addSafePassiveEventListener } from '../utils/event';
import type { EventHandlers, ListenerTarget } from './agAbstractBean';
import { AgAbstractBean } from './agAbstractBean';
import type { AgBeansFor, AgDeclaredDeps } from './agBeanGraph';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class AgAbstractUiBean<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties>,
    TLocalEventType extends string = 'destroyed',
    TDeps extends AgDeclaredDeps<TBeanCollection> = readonly [],
    TOptional extends AgDeclaredDeps<TBeanCollection> = readonly [],
>
    extends AgAbstractBean<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TPropertiesService,
        TLocalEventType,
        TDeps,
        TOptional
    >
    implements AgUiBean<TBeanCollection, TProperties, TGlobalEvents, TLocalEventType>
{
    declare protected eventSvc: AgEventService<TGlobalEvents, TCommon>;

    // The UI kernel is wider: `throttleToFrame` and the element helpers read `eRootDiv` from it.
    declare protected beans: AgBeansFor<TBeanCollection, TDeps, TOptional> &
        Pick<
            TBeanCollection,
            Exclude<keyof AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, 'context'>
        > &
        Pick<AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, 'context'>;

    /** Also accepts `BaseEvents` handlers, which hosts register alongside their own events. */
    public override addManagedEventListeners(
        handlers:
            | { [K in keyof TGlobalEvents]?: (event: TGlobalEvents[K]) => void }
            | { [K in keyof BaseEvents]?: (event: BaseEvents[K]) => void }
    ) {
        return super.addManagedEventListeners(handlers as { [K in keyof TGlobalEvents]?: (event: any) => void });
    }

    public addManagedElementListeners<TEvent extends keyof HTMLElementEventMap>(
        object: Element | Document | ShadowRoot,
        handlers: EventHandlers<TEvent, HTMLElementEventMap[TEvent]>
    ) {
        return this._setupListeners<keyof HTMLElementEventMap>(object, handlers);
    }

    protected override attachListener(object: ListenerTarget, event: string, listener: (event?: any) => void): void {
        if (isHtmlElement(object)) {
            _addSafePassiveEventListener(object, event, listener);
            return;
        }
        super.attachListener(object, event, listener);
    }

    /** Returns a function that runs `callback` at most once per animation frame. `_requestAnimationFrame`
     *  has no cancellation, so a destroyed bean instead leaves the flag set and queues no further frames. */
    protected throttleToFrame(callback: () => void): () => void {
        let queued = false;
        const run = () => {
            if (this.isAlive()) {
                queued = false;
                callback();
            }
        };
        return () => {
            if (!queued) {
                queued = true;
                _requestAnimationFrame(this.beans, run);
            }
        };
    }
}

/** Guarded because `HTMLElement` is undefined in a host with no DOM. */
function isHtmlElement(object: unknown): object is HTMLElement {
    return typeof HTMLElement !== 'undefined' && object instanceof HTMLElement;
}
