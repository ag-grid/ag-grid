import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AutoSizeStrategy } from '../interfaces/autoSize';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import columnDelayRenderCSS from './column-delay-render.css';

const HideClass = 'ag-delay-render';
// A hide still outstanding after this is a missed reveal; a flicker beats a permanently blank grid.
const REVEAL_FAIL_SAFE_MS = 1000;
type ColumnDelayRenderKey = 'colFlex' | 'columnState' | AutoSizeStrategy['type'];

export class ColumnDelayRenderService extends BeanStub implements NamedBean {
    beanName = 'colDelayRenderSvc' as const;

    private hideRequested = false;
    private alreadyRevealed = false;
    private timesRetried = 0;
    private failSafeTimer: ReturnType<typeof setTimeout> | undefined;

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
            this.failSafeTimer = setTimeout(() => this.forceReveal(), REVEAL_FAIL_SAFE_MS);
        }
    }

    private forceReveal(): void {
        this.failSafeTimer = undefined;
        if (this.alreadyRevealed || !this.isAlive()) {
            return;
        }
        this.warn(334, { requesters: [...this.requesters] });
        this.requesters.clear();
        this.revealWhenRendered();
    }

    public override destroy(): void {
        clearTimeout(this.failSafeTimer);
        super.destroy();
    }

    public revealColumns(key: ColumnDelayRenderKey): void {
        // Already revealed, or destroyed, so nothing to do. An unknown key means this caller never hid:
        // callers reveal unconditionally even where their hide was conditional, and such a reveal must
        // not count, or it marks the grid revealed before anything hid it and no later hide can apply.
        if (this.alreadyRevealed || !this.isAlive() || !this.requesters.has(key)) {
            return;
        }
        this.requesters.delete(key);
        this.revealWhenRendered();
    }

    private revealWhenRendered(): void {
        // Called on a timer as well as directly, so re-check liveness. Outstanding requesters mean
        // someone else still wants the columns hidden.
        if (this.alreadyRevealed || !this.isAlive() || this.requesters.size > 0) {
            return;
        }

        const { renderStatus, ctrlsSvc } = this.beans;
        if (renderStatus) {
            // For React, we need to check that the headers are actually rendered before revealing them.
            // We add a fail safe to only try this 5 times, after that we reveal anyway.
            if (!renderStatus.areHeaderCellsRendered() && this.timesRetried < 5) {
                this.timesRetried++;
                setTimeout(() => this.revealWhenRendered());
                return;
            }
            this.timesRetried = 0;
        }

        ctrlsSvc.getGridBodyCtrl().eGridBody.classList.remove(HideClass);
        this.alreadyRevealed = true;
        clearTimeout(this.failSafeTimer);
        this.failSafeTimer = undefined;
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
