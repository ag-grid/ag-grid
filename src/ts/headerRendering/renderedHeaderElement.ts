import _ from '../utils';
import Column from "../entities/column";
import GridOptionsWrapper from "../gridOptionsWrapper";
import {AbstractColDef} from "../entities/colDef";

export default class RenderedHeaderElement {

    private eRoot: HTMLElement;
    private dragStartX: number;
    private gridOptionsWrapper: GridOptionsWrapper;

    constructor(eRoot: HTMLElement, gridOptionsWrapper: GridOptionsWrapper) {
        this.eRoot = eRoot;
        this.gridOptionsWrapper = gridOptionsWrapper;
    }

    // methods implemented by the base classes
    public destroy(): void {}
    public refreshFilterIcon(): void {}
    public refreshSortIcon(): void {}
    public onDragStart(): void {}
    public onDragging(dragChange: number, finished: boolean): void {}
    public onIndividualColumnResized(column: Column): void {}
    public getGui(): HTMLElement { return null; }

    protected getGridOptionsWrapper(): GridOptionsWrapper {
        return this.gridOptionsWrapper;
    }

    public addDragHandler(eDraggableElement: any) {
        var that = this;
        eDraggableElement.addEventListener('mousedown', function (downEvent: any) {
            that.onDragStart();
            that.eRoot.style.cursor = "col-resize";
            that.dragStartX = downEvent.clientX;

            var listenersToRemove = <any> {};
            var lastDelta = 0;

            listenersToRemove.mousemove = function (moveEvent: any) {
                var newX = moveEvent.clientX;
                lastDelta = newX - that.dragStartX;
                that.onDragging(lastDelta, false);
            };

            listenersToRemove.mouseup = function () {
                that.stopDragging(listenersToRemove, lastDelta);
            };

            listenersToRemove.mouseleave = function () {
                that.stopDragging(listenersToRemove, lastDelta);
            };

            that.eRoot.addEventListener('mousemove', listenersToRemove.mousemove);
            that.eRoot.addEventListener('mouseup', listenersToRemove.mouseup);
            that.eRoot.addEventListener('mouseleave', listenersToRemove.mouseleave);
        });
    }

    public stopDragging(listenersToRemove: any, dragChange: number) {
        this.eRoot.style.cursor = "";
        var that = this;
        _.iterateObject(listenersToRemove, function (key: any, listener: any) {
            that.eRoot.removeEventListener(key, listener);
        });
        that.onDragging(dragChange, true);
    }

    protected addHeaderClassesFromCollDef(abstractColDef: AbstractColDef, eHeaderCell: HTMLElement) {
        if (abstractColDef && abstractColDef.headerClass) {
            var classToUse: string | string[];
            if (typeof abstractColDef.headerClass === 'function') {
                var params = {
                    // bad naming, as colDef here can be a group or a column,
                    // however most people won't appreciate the difference,
                    // so keeping it as colDef to avoid confusion.
                    colDef: abstractColDef,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                var headerClassFunc = <(params: any) => string | string[]> abstractColDef.headerClass;
                classToUse = headerClassFunc(params);
            } else {
                classToUse = <string | string[]> abstractColDef.headerClass;
            }

            if (typeof classToUse === 'string') {
                _.addCssClass(eHeaderCell, classToUse);
            } else if (Array.isArray(classToUse)) {
                classToUse.forEach((cssClassItem: any): void => {
                    _.addCssClass(eHeaderCell, cssClassItem);
                });
            }
        }
    }

}
