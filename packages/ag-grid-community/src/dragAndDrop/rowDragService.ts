import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import { _isCellSelectionEnabled, _isClientSideRowModel } from '../gridOptionsUtils';
import { RowDragComp } from './rowDragComp';
import { RowDragFeature } from './rowDragFeature';
import type { RowDragVisibility } from './rowDragTypes';

export class RowDragService extends BeanStub implements NamedBean {
    beanName = 'rowDragSvc' as const;

    public rowDragFeature: RowDragFeature | null = null;
    public visibility: RowDragVisibility = 'suppress';

    public setupRowDrag(element: HTMLElement, ctrl: BeanStub): void {
        const rowDragFeature = ctrl.createManagedBean(new RowDragFeature(element));
        const dragAndDrop = this.beans.dragAndDrop!;
        dragAndDrop.addDropTarget(rowDragFeature);
        ctrl.addDestroyFunc(() => dragAndDrop.removeDropTarget(rowDragFeature));
        this.rowDragFeature = rowDragFeature;

        const refreshVisibility = () => this.refreshVisibility();

        this.addManagedPropertyListeners(
            ['rowDragManaged', 'suppressRowDrag', 'refreshAfterGroupEdit'],
            refreshVisibility
        );

        this.addManagedEventListeners({
            newColumnsLoaded: refreshVisibility,
            columnRowGroupChanged: refreshVisibility,
            columnPivotModeChanged: refreshVisibility,
            sortChanged: refreshVisibility,
            filterChanged: refreshVisibility,
        });

        this.visibility = this.computeVisibility();
    }

    public createRowDragComp(
        cellValueFn: () => string,
        rowNode: RowNode,
        column?: AgColumn,
        customGui?: HTMLElement,
        dragStartPixels?: number,
        alwaysVisible?: boolean
    ): RowDragComp {
        return new RowDragComp(cellValueFn, rowNode, column, customGui, dragStartPixels, alwaysVisible);
    }

    public createRowDragCompForRow(rowNode: RowNode, element: HTMLElement): RowDragComp | undefined {
        if (_isCellSelectionEnabled(this.gos)) {
            return undefined;
        }
        const translate = this.getLocaleTextFunc();
        return this.createRowDragComp(
            () => `1 ${translate('rowDragRow', 'row')}`,
            rowNode,
            undefined,
            element,
            undefined,
            true
        );
    }

    public createRowDragCompForCell(
        rowNode: RowNode,
        column: AgColumn,
        cellValueFn: () => string,
        element?: HTMLElement,
        dragStartPixels?: number,
        alwaysVisible?: boolean
    ): RowDragComp | undefined {
        const gos = this.gos;
        if (gos.get('rowDragManaged')) {
            // row dragging only available in default row model and when not using pagination
            if (!_isClientSideRowModel(gos) || gos.get('pagination')) {
                return undefined;
            }
        }

        const rowDragComp = this.createRowDragComp(
            cellValueFn,
            rowNode,
            column,
            element,
            dragStartPixels,
            alwaysVisible
        );
        return rowDragComp;
    }

    public cancelRowDrag(): void {
        if (this.rowDragFeature?.lastDraggingEvent) {
            this.beans.dragSvc?.cancelDrag();
        }
    }

    private computeVisibility(): RowDragVisibility {
        const beans = this.beans;
        const gos = beans.gos;

        if (gos.get('suppressRowDrag')) {
            return 'suppress';
        }

        const rowDragManaged = gos.get('rowDragManaged');
        if (!rowDragManaged) {
            return 'visible';
        }

        const pivoting = beans.colModel.isPivotMode();

        if ((pivoting || beans.rowGroupColsSvc?.columns?.length) && !gos.get('refreshAfterGroupEdit')) {
            return 'hidden';
        }

        if (pivoting) {
            return 'disabled';
        }

        if (beans.filterManager?.isAnyFilterPresent()) {
            return 'disabled';
        }

        if (beans.sortSvc?.isSortActive()) {
            return 'disabled';
        }

        return 'visible';
    }

    private refreshVisibility(): void {
        const previousVisibility = this.visibility;
        const newVisibility = this.computeVisibility();
        if (previousVisibility !== newVisibility) {
            this.visibility = newVisibility;
            this.eventSvc?.dispatchEvent({ type: 'rowDragVisibilityChanged' });
        }
    }
}
