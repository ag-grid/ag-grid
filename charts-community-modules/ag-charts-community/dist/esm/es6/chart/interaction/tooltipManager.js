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
        ids.reverse();
        ids.slice(0, 1).forEach((id) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvaW50ZXJhY3Rpb24vdG9vbHRpcE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0E7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFRdkIsWUFBbUIsT0FBZ0IsRUFBRSxrQkFBc0M7UUFQMUQsV0FBTSxHQUFpQyxFQUFFLENBQUM7UUFHbkQsbUJBQWMsR0FBeUIsRUFBRSxDQUFDO1FBRTFDLGVBQVUsR0FBbUIsRUFBRSxDQUFDO1FBR3BDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXZCLE1BQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFTSxhQUFhLENBQUMsUUFBZ0IsRUFBRSxJQUFrQixFQUFFLE9BQWdCOztRQUN2RSxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFDakIsT0FBTyxHQUFHLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsMENBQUUsT0FBTyxDQUFDO1NBQzVDO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVNLG1CQUFtQixDQUFDLFFBQWdCLEVBQUUsSUFBVztRQUNwRCxJQUFJLElBQUksRUFBRTtZQUNOLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFD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