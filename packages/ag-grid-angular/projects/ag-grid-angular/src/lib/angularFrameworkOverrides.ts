import { Injectable, NgZone } from '@angular/core';
import type { FrameworkOverridesIncomingSource, LocalEventService } from 'ag-stack';

import type { IFrameworkEventListenerService } from 'ag-grid-community';
import { VanillaFrameworkOverrides } from 'ag-grid-community';

import { AngularFrameworkEventListenerService } from './angularFrameworkEventListenerService';

@Injectable()
export class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    public override readonly batchFrameworkComps: boolean = true;

    /** False when zoneless (`NoopNgZone` or no zone): nothing is ever wrapped, so no listener needs tracking. */
    private readonly hasZone: boolean;

    constructor(private readonly _ngZone: NgZone | null) {
        super('angular');

        this.hasZone = _ngZone instanceof NgZone;

        if (!_ngZone) {
            return; // the inherited wrapIncoming and wrapOutgoing run callbacks as they are
        }

        const isRunningWithinTestZone: boolean =
            (window as any)?.AG_GRID_UNDER_TEST ?? !!(window as any)?.Zone?.AsyncTestZoneSpec;

        // grid work passed to wrapIncoming runs outside Angular so it triggers no change detection
        this.wrapIncoming = isRunningWithinTestZone
            ? (callback, source) => {
                  if (source === 'resize-observer' || source === 'popupPositioning') {
                      // ensure resize observer callbacks are run outside of Angular even under test due to Jest not supporting ResizeObserver
                      // which means it just loops continuously with a setTimeout with no way to flush the queue or have fixture.whenStable() resolve.
                      return _ngZone.runOutsideAngular(callback);
                  }
                  // When under test run inside Angular so that tests can use fixture.whenStable() to wait for async operations to complete.
                  return callback();
              }
            : _ngZone.runOutsideAngular.bind(_ngZone);

        // event handlers, and listeners added inside the zone, run inside it so their template bindings update
        this.wrapOutgoing = this.runInsideAngular.bind(this);
    }

    /**
     * The shouldWrapOutgoing property is used to determine if events should be run outside of Angular or not.
     * If an event handler is registered outside of Angular then we should not wrap the event handler
     * with runInsideAngular() as the user may not have wanted this.
     * Listeners a user adds to row nodes, columns and column groups are wrapped only when this is true; the grid's own
     * listeners use `__addEventListener`, which never wraps.
     */
    public get shouldWrapOutgoing() {
        return this._ngZone && NgZone.isInAngularZone();
    }

    public wrapLocalListener<T extends (e: any) => void>(
        localEventService: LocalEventService<any>,
        eventType: string,
        userListener: T,
        async?: boolean
    ): T {
        if (!this.hasZone) {
            return userListener;
        }
        // idempotent, so set on every in-zone add rather than tracked
        if (this.shouldWrapOutgoing) {
            localEventService.setFrameworkOverrides(this);
        }
        let wrapper = localEventService.listenerWrapper;
        if (!wrapper) {
            wrapper = new AngularFrameworkEventListenerService<any, any>(this);
            localEventService.listenerWrapper = wrapper;
        }
        return wrapper.wrap(eventType, userListener, async);
    }

    public createGlobalEventListenerWrapper(): IFrameworkEventListenerService<any, any> {
        return new AngularFrameworkEventListenerService(this);
    }

    override isFrameworkComponent(comp: any): boolean {
        if (!comp) {
            return false;
        }
        const prototype = comp.prototype;
        return prototype && 'agInit' in prototype;
    }

    runInsideAngular<T>(callback: () => T): T {
        const ngZone = this._ngZone;
        if (!ngZone || NgZone.isInAngularZone()) {
            return callback();
        }
        return ngZone.run(callback);
    }

    runOutsideAngular<T>(callback: () => T, source?: FrameworkOverridesIncomingSource): T {
        return this.wrapIncoming(callback, source);
    }
}
