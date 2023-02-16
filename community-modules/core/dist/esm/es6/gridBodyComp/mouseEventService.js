/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MouseEventService_1;
import { Bean } from "../context/context";
import { Autowired } from "../context/context";
import { NumberSequence } from '../utils';
import { BeanStub } from "../context/beanStub";
import { getCtrlForEvent } from "../utils/event";
import { exists } from "../utils/generic";
import { CellCtrl } from "../rendering/cell/cellCtrl";
let MouseEventService = MouseEventService_1 = class MouseEventService extends BeanStub {
    constructor() {
        super(...arguments);
        this.gridInstanceId = MouseEventService_1.gridInstanceSequence.next();
    }
    // we put the instance id onto the main DOM element. this is used for events, when grids are inside grids,
    // so the grid can work out if the even came from this grid or a grid inside this one. see the ctrl+v logic
    // for where this is used.
    stampTopLevelGridCompWithGridInstance(eGridDiv) {
        eGridDiv[MouseEventService_1.GRID_DOM_KEY] = this.gridInstanceId;
    }
    getRenderedCellForEvent(event) {
        return getCtrlForEvent(this.gridOptionsService, event, CellCtrl.DOM_DATA_KEY_CELL_CTRL);
    }
    // walks the path of the event, and returns true if this grid is the first one that it finds. if doing
    // master / detail grids, and a child grid is found, then it returns false. this stops things like copy/paste
    // getting executed on many grids at the same time.
    isEventFromThisGrid(event) {
        const res = this.isElementInThisGrid(event.target);
        return res;
    }
    isElementInThisGrid(element) {
        let pointer = element;
        while (pointer) {
            const instanceId = pointer[MouseEventService_1.GRID_DOM_KEY];
            if (exists(instanceId)) {
                const eventFromThisGrid = instanceId === this.gridInstanceId;
                return eventFromThisGrid;
            }
            pointer = pointer.parentElement;
        }
        return false;
    }
    getCellPositionForEvent(event) {
        const cellComp = this.getRenderedCellForEvent(event);
        return cellComp ? cellComp.getCellPosition() : null;
    }
    getNormalisedPosition(event) {
        const gridPanelHasScrolls = this.gridOptionsService.isDomLayout('normal');
        const e = event;
        let x;
        let y;
        if (e.clientX != null || e.clientY != null) {
            x = e.clientX;
            y = e.clientY;
        }
        else {
            x = e.x;
            y = e.y;
        }
        if (gridPanelHasScrolls) {
            const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
            const vRange = gridBodyCon.getScrollFeature().getVScrollPosition();
            const hRange = gridBodyCon.getScrollFeature().getHScrollPosition();
            x += hRange.left;
            y += vRange.top;
        }
        return { x, y };
    }
};
MouseEventService.gridInstanceSequence = new NumberSequence();
MouseEventService.GRID_DOM_KEY = '__ag_grid_instance';
__decorate([
    Autowired('ctrlsService')
], MouseEventService.prototype, "ctrlsService", void 0);
MouseEventService = MouseEventService_1 = __decorate([
    Bean('mouseEventService')
], MouseEventService);
export { MouseEventService };
