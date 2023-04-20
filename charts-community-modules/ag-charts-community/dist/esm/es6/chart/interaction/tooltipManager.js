/**
 * Manages the tooltip HTML an element. Tracks the requested HTML from distinct dependents and
 * handles conflicting tooltip requests.
 */
export class TooltipManager {
    constructor(tooltip, interactionManager) {
        this.states = {};
        this.exclusiveAreas = {};
        this.destroyFns = [];
        this.tooltip = tooltip;
        const hoverRef = interactionManager.addListener('hover', (e) => this.checkExclusiveRects(e));
        this.destroyFns.push(() => interactionManager.removeListener(hoverRef));
    }
    updateTooltip(callerId, meta, content) {
        var _a;
        if (content == null) {
            content = (_a = this.states[callerId]) === null || _a === void 0 ? void 0 : _a.content;
        }
        this.states[callerId] = { content, meta };
        this.applyStates();
    }
    updateExclusiveRect(callerId, area) {
        if (area) {
            this.exclusiveAreas[callerId] = area;
        }
        else {
            delete this.exclusiveAreas[callerId];
        }
    }
    removeTooltip(callerId) {
        delete this.states[callerId];
        this.applyStates();
    }
    getTooltipMeta(callerId) {
        var _a;
        return (_a = this.states[callerId]) === null || _a === void 0 ? void 0 : _a.meta;
    }
    destroy() {
        for (const destroyFn of this.destroyFns) {
            destroyFn();
        }
    }
    checkExclusiveRects(e) {
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
    applyStates() {
        var _a;
        const ids = this.appliedExclusiveArea ? [this.appliedExclusiveArea] : Object.keys(this.states);
        let contentToApply = undefined;
        let metaToApply = undefined;
        // Last added entry wins.
        ids.reverse()
            .slice(0, 1)
            .forEach((id) => {
            var _a;
            const { content, meta } = (_a = this.states[id]) !== null && _a !== void 0 ? _a : {};
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
