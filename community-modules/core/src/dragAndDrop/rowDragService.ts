import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import { _isCellSelectionEnabled, _isClientSideRowModel } from '../gridOptionsUtils';
import { _warnOnce } from '../utils/function';
import type { DragAndDropService } from './dragAndDropService';
import { RowDragComp } from './rowDragComp';
import { RowDragFeature } from './rowDragFeature';

export class RowDragService extends BeanStub implements NamedBean {
    beanName = 'rowDragService' as const;

    private dragAndDropService: DragAndDropService;

    private rowDragFeature?: RowDragFeature;

    public wireBeans(beans: BeanCollection): void {
        this.dragAndDropService = beans.dragAndDropService!;
    }

    public setupRowDrag(element: HTMLElement, ctrl: BeanStub): void {
        const rowDragFeature = ctrl.createManagedBean(new RowDragFeature(element));
        this.dragAndDropService.addDropTarget(rowDragFeature);
        ctrl.addDestroyFunc(() => this.dragAndDropService.removeDropTarget(rowDragFeature));
        this.rowDragFeature = rowDragFeature;
    }

    public getRowDragFeature(): RowDragFeature | undefined {
        return this.rowDragFeature;
    }

    public createRowDragComp(
        cellValueFn: () => string,
        rowNode: RowNode,
        column?: AgColumn,
        customGui?: HTMLElement,
        dragStartPixels?: number,
        suppressVisibilityChange?: boolean
    ): RowDragComp {
        return new RowDragComp(cellValueFn, rowNode, column, customGui, dragStartPixels, suppressVisibilityChange);
    }

    public createRowDragCompForRow(rowNode: RowNode, element: HTMLElement): RowDragComp | undefined {
        if (_isCellSelectionEnabled(this.gos)) {
            _warnOnce(
                "Setting `rowDragEntireRow: true` in the gridOptions doesn't work with `selection.mode = 'cell'`"
            );
            return undefined;
        }
        const translate = this.localeService.getLocaleTextFunc();
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
        suppressVisibilityChange?: boolean
    ): RowDragComp | undefined {
        if (this.gos.get('rowDragManaged')) {
            // row dragging only available in default row model
            if (!_isClientSideRowModel(this.gos)) {
                _warnOnce('managed row dragging is only allowed in the Client Side Row Model');
                return undefined;
            }

            if (this.gos.get('pagination')) {
                _warnOnce('managed row dragging is not possible when doing pagination');
                return undefined;
            }
        }

        // otherwise (normal case) we are creating a RowDraggingComp for the first time
        const rowDragComp = this.createRowDragComp(
            cellValueFn,
            rowNode,
            column,
            element,
            dragStartPixels,
            suppressVisibilityChange
        );
        return rowDragComp;
    }
}
