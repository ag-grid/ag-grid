import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AutoSizeStrategy } from '../interfaces/autoSize';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import columnDelayRenderCSS from './column-delay-render.css';

const HideClass = 'ag-delay-render';
type ColumnDelayRenderKey = 'colFlex' | 'columnState' | AutoSizeStrategy['type'];

export class ColumnDelayRenderService extends BeanStub implements NamedBean {
    beanName = 'colDelayRenderSvc' as const;

    private hideRequested = false;
    private alreadyRevealed = false;
    private timesRetried = 0;

    private readonly requesters = new Set<ColumnDelayRenderKey>();

    public hideColumns(key: ColumnDelayRenderKey): void {
        if (this.alreadyRevealed || this.requesters.has(key)) {
            // If already revealed then we don't want to hide again
            // Already requested a hide, no need to do it again
            return;
        }

        this.requesters.add(key);

        if (!this.hideRequested) {
            // If already requested a hide then no need to do it again, avoid unnecessary whenReady calls
            this.beans.ctrlsSvc.whenReady(this, (p) => {
                p.gridBodyCtrl.eGridBody.classList.add(HideClass);
            });
            this.hideRequested = true;
        }
    }

    public revealColumns(key: ColumnDelayRenderKey): void {
        if (this.alreadyRevealed || !this.isAlive()) {
            // If already revealed then we don't want to reveal again
            // As calling in a loop with setTimeout need to check if alive
            return;
        }
        this.requesters.delete(key);
        if (this.requesters.size > 0) {
            // If there are still requesters then we don't want to reveal yet
            return;
        }

        this.checkAndReveal();
    }

    /**
     * Checks whether headers are rendered and reveals the grid if so. Separated from
     * `revealColumns` so that retries do not mutate `requesters` — re-entrant callers
     * (e.g. an auto-group column triggering a second flex recalculation in SSRM + tree
     * data mode) legitimately re-add keys to `requesters` after the initial reveal was
     * scheduled, and the retry must not silently remove those keys.
     */
    private checkAndReveal(): void {
        if (this.alreadyRevealed || !this.isAlive()) {
            return;
        }
        if (this.requesters.size > 0) {
            // A new requester was added while we were waiting for headers to render.
            // It will call revealColumns when done, which will invoke checkAndReveal again.
            return;
        }

        const { renderStatus, ctrlsSvc } = this.beans;
        if (renderStatus) {
            // For React, we need to check that the headers are actually rendered before revealing them.
            // We add a fail safe to only try this 5 times, after that we reveal anyway.
            if (!renderStatus.areHeaderCellsRendered() && this.timesRetried < 5) {
                this.timesRetried++;
                setTimeout(() => this.checkAndReveal());
                return;
            }
            this.timesRetried = 0;
        }

        ctrlsSvc.getGridBodyCtrl().eGridBody.classList.remove(HideClass);
        this.alreadyRevealed = true;
    }
}

/**
 * @internal
 *
 * @feature Columns -> Column Sizing
 * @gridOption autoSizeStrategy, colDef.flex, initialState
 */
export const ColumnDelayRenderModule: _ModuleWithoutApi = {
    moduleName: 'ColumnDelayRender',
    version: VERSION,
    beans: [ColumnDelayRenderService],
    css: [columnDelayRenderCSS],
};
