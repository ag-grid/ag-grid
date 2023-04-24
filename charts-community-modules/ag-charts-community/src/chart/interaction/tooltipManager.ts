import { BBox } from '../../scene/bbox';
import { Tooltip, TooltipMeta } from '../tooltip/tooltip';
import { InteractionEvent, InteractionManager } from './interactionManager';

interface TooltipState {
    content: string;
    meta?: TooltipMeta;
}

/**
 * Manages the tooltip HTML an element. Tracks the requested HTML from distinct dependents and
 * handles conflicting tooltip requests.
 */
export class TooltipManager {
    private readonly states: Record<string, TooltipState> = {};
    private readonly tooltip: Tooltip;
    private appliedState?: TooltipState;
    private exclusiveAreas: Record<string, BBox> = {};
    private appliedExclusiveArea?: string;
    private destroyFns: (() => void)[] = [];

    public constructor(tooltip: Tooltip, interactionManager: InteractionManager) {
        this.tooltip = tooltip;

        const hoverRef = interactionManager.addListener('hover', (e) => this.checkExclusiveRects(e));
        this.destroyFns.push(() => interactionManager.removeListener(hoverRef));
    }

    public updateTooltip(callerId: string, meta?: TooltipMeta, content?: string) {
        if (content == null) {
            content = this.states[callerId]?.content;
        }

        this.states[callerId] = { content, meta };

        this.applyStates();
    }

    public updateExclusiveRect(callerId: string, area?: BBox) {
        if (area) {
            this.exclusiveAreas[callerId] = area;
        } else {
            delete this.exclusiveAreas[callerId];
        }
    }

    public removeTooltip(callerId: string) {
        delete this.states[callerId];

        this.applyStates();
    }

    public getTooltipMeta(callerId: string): TooltipMeta | undefined {
        return this.states[callerId]?.meta;
    }

    public destroy() {
        for (const destroyFn of this.destroyFns) {
            destroyFn();
        }
    }

    private checkExclusiveRects(e: InteractionEvent<'hover'>): void {
        let newAppliedExclusiveArea;
        for (const [entryId, area] of Object.entries(this.exclusiveAreas)) {
            if (!area.containsPoint(e.offsetX, e.offsetY)) {
                continue;
            }

            newAppliedExclusiveArea = entryId;
            break;
        }

        if (newAppliedExclusiveArea === this.appliedExclusiveArea) {
            return;
        }

        this.appliedExclusiveArea = newAppliedExclusiveArea;
        this.applyStates();
    }

    private applyStates() {
        const ids = this.appliedExclusiveArea ? [this.appliedExclusiveArea] : Object.keys(this.states);
        let contentToApply: string | undefined = undefined;
        let metaToApply: TooltipMeta | undefined = undefined;

        // Last added entry wins.
        ids.reverse()
            .slice(0, 1)
            .forEach((id) => {
                const { content, meta } = this.states[id] ?? {};
                contentToApply = content;
                metaToApply = meta;
            });

        if (metaToApply === undefined || contentToApply === undefined) {
            this.appliedState = undefined;
            this.tooltip.toggle(false);
            return;
        }

        if (this.appliedState?.content === contentToApply) {
            const renderInstantly = this.tooltip.isVisible();
            this.tooltip.show(metaToApply, undefined, renderInstantly);
        } else {
            this.tooltip.show(metaToApply, contentToApply);
        }

        this.appliedState = { content: contentToApply, meta: metaToApply };
    }
}
