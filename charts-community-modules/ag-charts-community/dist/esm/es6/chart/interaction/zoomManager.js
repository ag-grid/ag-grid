import { BaseManager } from './baseManager';
function isEqual(a, b) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (a === b)
        return true;
    if (((_a = a === null || a === void 0 ? void 0 : a.x) === null || _a === void 0 ? void 0 : _a.min) !== ((_b = b === null || b === void 0 ? void 0 : b.x) === null || _b === void 0 ? void 0 : _b.min))
        return false;
    if (((_c = a === null || a === void 0 ? void 0 : a.x) === null || _c === void 0 ? void 0 : _c.max) !== ((_d = b === null || b === void 0 ? void 0 : b.x) === null || _d === void 0 ? void 0 : _d.max))
        return false;
    if (((_e = a === null || a === void 0 ? void 0 : a.y) === null || _e === void 0 ? void 0 : _e.max) !== ((_f = b === null || b === void 0 ? void 0 : b.y) === null || _f === void 0 ? void 0 : _f.max))
        return false;
    if (((_g = a === null || a === void 0 ? void 0 : a.y) === null || _g === void 0 ? void 0 : _g.min) !== ((_h = b === null || b === void 0 ? void 0 : b.y) === null || _h === void 0 ? void 0 : _h.min))
        return false;
    return true;
}
/**
 * Manages the current zoom state for a chart. Tracks the requested zoom from distinct dependents
 * and handles conflicting zoom requests.
 */
export class ZoomManager extends BaseManager {
    constructor() {
        super();
        this.states = {};
        this.currentZoom = undefined;
    }
    updateZoom(callerId, newZoom) {
        delete this.states[callerId];
        if (newZoom != null) {
            this.states[callerId] = Object.assign({}, newZoom);
        }
        this.applyStates();
    }
    getZoom() {
        return this.currentZoom;
    }
    applyStates() {
        const currentZoom = this.currentZoom;
        const zoomToApply = {};
        // Last added entry wins.
        for (const [_, { x, y }] of Object.entries(this.states)) {
            zoomToApply.x = x !== null && x !== void 0 ? x : zoomToApply.x;
            zoomToApply.y = y !== null && y !== void 0 ? y : zoomToApply.y;
        }
        this.currentZoom = zoomToApply.x != null || zoomToApply.y != null ? zoomToApply : undefined;
        const changed = !isEqual(currentZoom, this.currentZoom);
        if (!changed) {
            return;
        }
        const event = Object.assign({ type: 'zoom-change' }, (currentZoom !== null && currentZoom !== void 0 ? currentZoom : {}));
        this.listeners.dispatch('zoom-change', event);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvaW50ZXJhY3Rpb24vem9vbU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQWdCNUMsU0FBUyxPQUFPLENBQUMsQ0FBaUIsRUFBRSxDQUFpQjs7SUFDakQsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3pCLElBQUksQ0FBQSxNQUFBLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxDQUFDLDBDQUFFLEdBQUcsT0FBSyxNQUFBLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxDQUFDLDBDQUFFLEdBQUcsQ0FBQTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQzFDLElBQUksQ0FBQSxNQUFBLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxDQUFDLDBDQUFFLEdBQUcsT0FBSyxNQUFBLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxDQUFDLDBDQUFFLEdBQUcsQ0FBQTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQzFDLElBQUksQ0FBQSxNQUFBLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxDQUFDLDBDQUFFLEdBQUcsT0FBSyxNQUFBLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxDQUFDLDBDQUFFLEdBQUcsQ0FBQTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQzFDLElBQUksQ0FBQSxNQUFBLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxDQUFDLDBDQUFFLEdBQUcsT0FBSyxNQUFBLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxDQUFDLDBDQUFFLEdBQUcsQ0FBQTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBRTFDLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sV0FBWSxTQUFRLFdBQTJDO0lBSXhFO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFKSyxXQUFNLEdBQWtDLEVBQUUsQ0FBQztRQUNwRCxnQkFBVyxHQUFtQixTQUFTLENBQUM7SUFJaEQsQ0FBQztJQUVNLFVBQVUsQ0FBQyxRQUFnQixFQUFFLE9BQXVCO1FBQ3ZELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3QixJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMscUJBQVEsT0FBTyxDQUFFLENBQUM7U0FDMUM7UUFFRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVNLE9BQU87UUFDVixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUVPLFdBQVc7UUFDZixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3JDLE1BQU0sV0FBVyxHQUFrQixFQUFFLENBQUM7UUFFdEMseUJBQXlCO1FBQ3pCLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3JELFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFELENBQUMsY0FBRCxDQUFDLEdBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNuQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBRCxDQUFDLGNBQUQsQ0FBQyxHQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDdEM7UUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUU1RixNQUFNLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDVixPQUFPO1NBQ1Y7UUFDRCxNQUFNLEtBQUssbUJBQ1AsSUFBSSxFQUFFLGFBQWEsSUFDaEIsQ0FBQyxXQUFXLGFBQVgsV0FBVyxjQUFYLFdBQVcsR0FBSSxFQUFFLENBQUMsQ0FDekIsQ0FBQztRQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO0NBQ0oifQ==