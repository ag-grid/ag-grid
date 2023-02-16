"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipManager = void 0;
/**
 * Manages the tooltip HTML an element. Tracks the requested HTML from distinct dependents and
 * handles conflicting tooltip requests.
 */
class TooltipManager {
    constructor(tooltip) {
        this.states = {};
        this.tooltip = tooltip;
    }
    updateTooltip(callerId, meta, content) {
        var _a;
        if (content == null) {
            content = (_a = this.states[callerId]) === null || _a === void 0 ? void 0 : _a.content;
        }
        delete this.states[callerId];
        if (meta != null && content != null) {
            this.states[callerId] = { content, meta };
        }
        this.applyStates();
    }
    getTooltipMeta(callerId) {
        var _a;
        return (_a = this.states[callerId]) === null || _a === void 0 ? void 0 : _a.meta;
    }
    applyStates() {
        var _a;
        let contentToApply = undefined;
        let metaToApply = undefined;
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
        if (((_a = this.appliedState) === null || _a === void 0 ? void 0 : _a.content) === contentToApply) {
            const renderInstantly = this.tooltip.isVisible();
            this.tooltip.show(metaToApply, undefined, renderInstantly);
        }
        else {
            this.tooltip.show(metaToApply, contentToApply);
        }
        this.appliedState = { content: contentToApply, meta: metaToApply };
    }
}
exports.TooltipManager = TooltipManager;
