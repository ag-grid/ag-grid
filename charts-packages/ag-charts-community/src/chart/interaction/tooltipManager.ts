import { Tooltip, TooltipMeta } from '../tooltip/tooltip';

interface TooltipState {
    content: string;
    meta: TooltipMeta;
}

/**
 * Manages the tooltip HTML an element. Tracks the requested HTML from distinct dependents and
 * handles conflicting tooltip requests.
 */
export class TooltipManager {
    private readonly states: Record<string, TooltipState> = {};
    private readonly tooltip: Tooltip;
    private appliedState?: TooltipState;

    public constructor(tooltip: Tooltip) {
        this.tooltip = tooltip;
    }

    public updateTooltip(callerId: string, meta?: TooltipMeta, content?: string) {
        if (content == null) {
            content = this.states[callerId]?.content;
        }

        delete this.states[callerId];

        if (meta != null && content != null) {
            this.states[callerId] = { content, meta };
        }

        this.applyStates();
    }

    public getTooltipMeta(callerId: string): TooltipMeta | undefined {
        return this.states[callerId]?.meta;
    }

    private applyStates() {
        let contentToApply: string | undefined = undefined;
        let metaToApply: TooltipMeta | undefined = undefined;

        // Last added entry wins.
        Object.entries(this.states)
            .reverse()
            .slice(0, 1)
            .forEach(([_, { content, meta }]) => {
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
