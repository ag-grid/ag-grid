import type { LocaleTextFunc } from '../agStack/interfaces/iLocaleService';
import { _isElementOverflowingCallback } from '../agStack/utils/dom';
import { _exists } from '../agStack/utils/generic';
import { _getValueUsingField } from '../agStack/utils/value';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { HeaderCellCtrl } from '../headerRendering/cells/column/headerCellCtrl';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { ICellEditor } from '../interfaces/iCellEditor';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { ITooltipCtrl, ITooltipCtrlParams, TooltipFeature } from './tooltipFeature';
import { _isShowTooltipWhenTruncated } from './tooltipFeature';

const getEditErrorsForPosition = (
    beans: BeanCollection,
    cellCtrl: CellCtrl,
    translate: LocaleTextFunc
): string | undefined => {
    const { editModelSvc } = beans;

    const cellValidationErrors = editModelSvc?.getCellValidationModel()?.getCellValidation(cellCtrl)?.errorMessages;
    const rowValidationErrors = editModelSvc?.getRowValidationModel().getRowValidation(cellCtrl)?.errorMessages;

    const errors = cellValidationErrors || rowValidationErrors;

    return errors?.length ? errors.join(translate('tooltipValidationErrorSeparator', '. ')) : undefined;
};

export class TooltipService extends BeanStub implements NamedBean {
    beanName = 'tooltipSvc' as const;

    public setupHeaderTooltip(
        existingTooltipFeature: TooltipFeature | undefined,
        ctrl: HeaderCellCtrl,
        passedValue?: string,
        shouldDisplayTooltip?: () => boolean
    ): TooltipFeature | undefined {
        if (existingTooltipFeature) {
            ctrl.destroyBean(existingTooltipFeature);
        }

        const gos = this.gos;
        const isTooltipWhenTruncated = _isShowTooltipWhenTruncated(gos);
        const { column, eGui } = ctrl;
        const colDef = column.getColDef();

        if (!shouldDisplayTooltip && isTooltipWhenTruncated && !colDef.headerComponent) {
            shouldDisplayTooltip = _isElementOverflowingCallback(
                () => eGui.querySelector('.ag-header-cell-text') as HTMLElement | undefined
            );
        }
        const location = 'header';
        const headerLocation = 'header';
        const valueFormatted = this.beans.colNames.getDisplayNameForColumn(column, headerLocation, true);
        const value = passedValue ?? valueFormatted;
        const tooltipCtrl: ITooltipCtrl = {
            getGui: () => eGui,
            getLocation: () => location,
            getTooltipValue: () =>
                passedValue ??
                colDef?.headerTooltipValueGetter?.(
                    _addGridCommonParams(gos, { location, colDef, column, value, valueFormatted })
                ) ??
                colDef?.headerTooltip,
            shouldDisplayTooltip,
            getAdditionalParams: () => ({
                column,
                colDef: column.getColDef(),
            }),
        };

        let tooltipFeature = this.createTooltipFeature(tooltipCtrl);
        if (tooltipFeature) {
            tooltipFeature = ctrl.createBean(tooltipFeature);
            ctrl.setRefreshFunction('tooltip', () => tooltipFeature!.refreshTooltip());
        }
        return tooltipFeature;
    }

    public setupHeaderGroupTooltip(
        existingTooltipFeature: TooltipFeature | undefined,
        ctrl: HeaderGroupCellCtrl,
        passedValue?: string,
        shouldDisplayTooltip?: () => boolean
    ): TooltipFeature | undefined {
        if (existingTooltipFeature) {
            ctrl.destroyBean(existingTooltipFeature);
        }
        const gos = this.gos;
        const isTooltipWhenTruncated = _isShowTooltipWhenTruncated(gos);
        const { column, eGui } = ctrl;
        const colDef = column.getColGroupDef();

        if (!shouldDisplayTooltip && isTooltipWhenTruncated && !colDef?.headerGroupComponent) {
            shouldDisplayTooltip = _isElementOverflowingCallback(
                () => eGui.querySelector('.ag-header-group-text') as HTMLElement | undefined
            );
        }

        const location = 'headerGroup';
        const headerLocation = 'header';
        const valueFormatted = this.beans.colNames.getDisplayNameForColumnGroup(column, headerLocation);
        const value = passedValue ?? valueFormatted;

        const tooltipCtrl: ITooltipCtrl = {
            getGui: () => eGui,
            getLocation: () => location,
            getTooltipValue: () =>
                passedValue ??
                colDef?.headerTooltipValueGetter?.(
                    _addGridCommonParams(gos, { location, colDef, column, value, valueFormatted })
                ) ??
                colDef?.headerTooltip,
            shouldDisplayTooltip,
            getAdditionalParams: () => {
                const additionalParams: ITooltipCtrlParams = {
                    column,
                };
                if (colDef) {
                    additionalParams.colDef = colDef;
                }
                return additionalParams;
            },
        };

        const tooltipFeature = this.createTooltipFeature(tooltipCtrl);
        return tooltipFeature ? ctrl.createBean(tooltipFeature) : tooltipFeature;
    }

    public enableCellTooltipFeature(
        ctrl: CellCtrl,
        value?: string,
        shouldDisplayTooltip?: () => boolean
    ): TooltipFeature | undefined {
        const { beans } = this;
        const { gos, editSvc } = beans;
        const { column, rowNode } = ctrl;

        let location: 'cell' | 'cellEditor' = 'cell';

        const getTooltipValue = () => {
            const isEditing = !!editSvc?.isEditing(ctrl);
            const errorMessages = !isEditing && getEditErrorsForPosition(beans, ctrl, this.getLocaleTextFunc());

            if (errorMessages) {
                location = 'cellEditor';
                return errorMessages;
            }

            location = 'cell';

            const colDef = column.getColDef();
            const data = rowNode.data;

            if (colDef.tooltipField && _exists(data)) {
                return _getValueUsingField(data, colDef.tooltipField, column.isTooltipFieldContainsDots());
            }

            const valueGetter = colDef.tooltipValueGetter;

            if (valueGetter) {
                return valueGetter(
                    _addGridCommonParams(gos, {
                        location: 'cell',
                        colDef: column.getColDef(),
                        column: column,
                        rowIndex: ctrl.cellPosition.rowIndex,
                        node: rowNode,
                        data: rowNode.data,
                        value: ctrl.value,
                        valueFormatted: ctrl.valueFormatted,
                    })
                );
            }

            return null;
        };

        const isTooltipWhenTruncated = _isShowTooltipWhenTruncated(gos);

        if (!shouldDisplayTooltip) {
            if (isTooltipWhenTruncated && !ctrl.isCellRenderer()) {
                shouldDisplayTooltip = () => {
                    const isEditing = !!editSvc?.isEditing(ctrl);
                    const errorMessages = !isEditing && getEditErrorsForPosition(beans, ctrl, this.getLocaleTextFunc());

                    if (errorMessages) {
                        return true;
                    }

                    const isTooltipEnabled = column.isTooltipEnabled();

                    if (!isTooltipEnabled) {
                        return false;
                    }

                    const isElementOverflowing = _isElementOverflowingCallback(() => {
                        const eCell = ctrl.eGui;
                        return eCell.children.length === 0
                            ? eCell
                            : (eCell.querySelector('.ag-cell-value') as HTMLElement | undefined);
                    });

                    return !isEditing && isElementOverflowing();
                };
            } else {
                shouldDisplayTooltip = () => !editSvc?.isEditing(ctrl);
            }
        }

        const tooltipCtrl: ITooltipCtrl = {
            getGui: () => ctrl.eGui,
            getLocation: () => location,
            getTooltipValue: value != null ? () => value : getTooltipValue,
            shouldDisplayTooltip,
            getAdditionalParams: () => ({
                column,
                colDef: column.getColDef(),
                rowIndex: ctrl.cellPosition.rowIndex,
                node: rowNode,
                data: rowNode.data,
                valueFormatted: ctrl.valueFormatted,
            }),
        };

        return this.createTooltipFeature(tooltipCtrl, beans);
    }

    public setupFullWidthRowTooltip(
        existingTooltipFeature: TooltipFeature | undefined,
        ctrl: RowCtrl,
        value: string,
        shouldDisplayTooltip?: () => boolean
    ): TooltipFeature | undefined {
        const tooltipParams: ITooltipCtrl = {
            getGui: () => ctrl.getFullWidthElement()!,
            getTooltipValue: () => value,
            getLocation: () => 'fullWidthRow',
            shouldDisplayTooltip,
        };

        const beans = this.beans;
        const context = beans.context;

        if (existingTooltipFeature) {
            ctrl.destroyBean(existingTooltipFeature, context);
        }

        const tooltipFeature = this.createTooltipFeature(tooltipParams, beans);
        if (!tooltipFeature) {
            return;
        }

        return ctrl.createBean(tooltipFeature, context);
    }

    public setupFormulaTooltip(cellCtrl: CellCtrl): TooltipFeature | undefined {
        const { beans } = this;
        const { context, formula } = beans;

        if (!formula || !beans.gos.get('enableFormulas')) {
            return;
        }

        const tooltipParams: ITooltipCtrl = {
            getGui: () => cellCtrl.eGui,
            getTooltipValue: () => {
                const error = formula?.getFormulaError(cellCtrl.column, cellCtrl.rowNode);
                return error ? error.message : undefined;
            },
            getLocation: () => 'cellFormula',
            shouldDisplayTooltip: () => {
                const error = formula?.getFormulaError(cellCtrl.column, cellCtrl.rowNode);
                return !!error;
            },
        };

        const tooltipFeature = this.createTooltipFeature(tooltipParams, beans);

        if (!tooltipFeature) {
            return;
        }

        return cellCtrl.createBean(tooltipFeature, context);
    }

    public setupCellEditorTooltip(cellCtrl: CellCtrl, editor: ICellEditor) {
        const { beans } = this;
        const { context } = beans;

        const el = editor.getValidationElement?.(true) || (!editor.isPopup?.() && cellCtrl.eGui);

        if (!el) {
            return;
        }

        const tooltipParams: ITooltipCtrl = {
            getGui: () => el,
            getTooltipValue: () => getEditErrorsForPosition(beans, cellCtrl, this.getLocaleTextFunc()),
            getLocation: () => 'cellEditor',
            shouldDisplayTooltip: () => {
                const { editModelSvc } = beans;
                const rowValidationMap = editModelSvc?.getRowValidationModel()?.getRowValidationMap();
                const cellValidationMap = editModelSvc?.getCellValidationModel()?.getCellValidationMap();

                const hasRowValidationErrors = !!rowValidationMap && rowValidationMap.size > 0;
                const hasCellValidationErrors = !!cellValidationMap && cellValidationMap.size > 0;

                return hasRowValidationErrors || hasCellValidationErrors;
            },
        };

        const tooltipFeature = this.createTooltipFeature(tooltipParams, beans);

        if (!tooltipFeature) {
            return;
        }

        return cellCtrl.createBean(tooltipFeature, context);
    }

    public initCol(column: AgColumn): void {
        const { colDef } = column;
        column.tooltipEnabled =
            _exists(colDef.tooltipField) || _exists(colDef.tooltipValueGetter) || _exists(colDef.tooltipComponent);
    }

    private createTooltipFeature(tooltipCtrl: ITooltipCtrl, beans?: BeanCollection): TooltipFeature | undefined {
        return this.beans.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, tooltipCtrl, beans);
    }
}
