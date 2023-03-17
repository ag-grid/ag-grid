/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DragSourceType } from "../../dragAndDrop/dragAndDropService";
import { Autowired, PostConstruct } from "../../context/context";
import { MoveColumnFeature } from "./moveColumnFeature";
import { BodyDropPivotTarget } from "./bodyDropPivotTarget";
import { BeanStub } from "../../context/beanStub";
export class BodyDropTarget extends BeanStub {
    constructor(pinned, eContainer) {
        super();
        this.pinned = pinned;
        this.eContainer = eContainer;
    }
    postConstruct() {
        this.ctrlsService.whenReady(p => {
            switch (this.pinned) {
                case 'left':
                    this.eSecondaryContainers = [
                        [p.gridBodyCtrl.getBodyViewportElement(), p.leftRowContainerCtrl.getContainerElement()],
                        [p.bottomLeftRowContainerCtrl.getContainerElement()],
                        [p.topLeftRowContainerCtrl.getContainerElement()]
                    ];
                    break;
                case 'right':
                    this.eSecondaryContainers = [
                        [p.gridBodyCtrl.getBodyViewportElement(), p.rightRowContainerCtrl.getContainerElement()],
                        [p.bottomRightRowContainerCtrl.getContainerElement()],
                        [p.topRightRowContainerCtrl.getContainerElement()]
                    ];
                    break;
                default:
                    this.eSecondaryContainers = [
                        [p.gridBodyCtrl.getBodyViewportElement(), p.centerRowContainerCtrl.getViewportElement()],
                        [p.bottomCenterRowContainerCtrl.getViewportElement()],
                        [p.topCenterRowContainerCtrl.getViewportElement()]
                    ];
                    break;
            }
        });
    }
    isInterestedIn(type) {
        return type === DragSourceType.HeaderCell ||
            (type === DragSourceType.ToolPanel && this.gridOptionsService.is('allowDragFromColumnsToolPanel'));
    }
    getSecondaryContainers() {
        return this.eSecondaryContainers;
    }
    getContainer() {
        return this.eContainer;
    }
    init() {
        this.moveColumnFeature = this.createManagedBean(new MoveColumnFeature(this.pinned, this.eContainer));
        this.bodyDropPivotTarget = this.createManagedBean(new BodyDropPivotTarget(this.pinned));
        this.dragAndDropService.addDropTarget(this);
    }
    getIconName() {
        return this.currentDropListener.getIconName();
    }
    // we want to use the bodyPivotTarget if the user is dragging columns in from the toolPanel
    // and we are in pivot mode, as it has to logic to set pivot/value/group on the columns when
    // dropped into the grid's body.
    isDropColumnInPivotMode(draggingEvent) {
        // in pivot mode, then if moving a column (ie didn't come from toolpanel) then it's
        // a standard column move, however if it came from the toolpanel, then we are introducing
        // dimensions or values to the grid
        return this.columnModel.isPivotMode() && draggingEvent.dragSource.type === DragSourceType.ToolPanel;
    }
    onDragEnter(draggingEvent) {
        // we pick the drop listener depending on whether we are in pivot mode are not. if we are
        // in pivot mode, then dropping cols changes the row group, pivot, value stats. otherwise
        // we change visibility state and position.
        this.currentDropListener = this.isDropColumnInPivotMode(draggingEvent) ? this.bodyDropPivotTarget : this.moveColumnFeature;
        this.currentDropListener.onDragEnter(draggingEvent);
    }
    onDragLeave(params) {
        this.currentDropListener.onDragLeave(params);
    }
    onDragging(params) {
        this.currentDropListener.onDragging(params);
    }
    onDragStop(params) {
        this.currentDropListener.onDragStop(params);
    }
}
__decorate([
    Autowired('dragAndDropService')
], BodyDropTarget.prototype, "dragAndDropService", void 0);
__decorate([
    Autowired('columnModel')
], BodyDropTarget.prototype, "columnModel", void 0);
__decorate([
    Autowired('ctrlsService')
], BodyDropTarget.prototype, "ctrlsService", void 0);
__decorate([
    PostConstruct
], BodyDropTarget.prototype, "postConstruct", null);
__decorate([
    PostConstruct
], BodyDropTarget.prototype, "init", null);
