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

type CellTooltipLocation = 'cell' | 'cellEditor' | 'cellFormula';

type ResolvedCellTooltip = {
    value: string | null | undefined;
    location: CellTooltipLocation;
    shouldDisplay?: () => boolean;
};

type CellTooltipDisplayFunctions = {
    shouldDisplayDefault: () => boolean;
    shouldDisplayColumnTooltip: () => boolean;
    shouldDisplayCustomTooltip: () => boolean;
};

type LocalisableError = Error & {
    getTranslatedMessage?: (translate: LocaleTextFunc) => string;
};

const getErrorTooltipMessage = (error: Error, translate: LocaleTextFunc): string => {
    const localisable = error as LocalisableError;
    if (typeof localisable.getTranslatedMessage === 'function') {
        return localisable.getTranslatedMessage(translate);
    }
    return error.message;
};

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

const getCellTruncationCheck = (beans: BeanCollection, ctrl: CellCtrl): (() => boolean) | undefined => {
    const isTooltipWhenTruncated = _isShowTooltipWhenTruncated(beans.gos);

    if (!isTooltipWhenTruncated) {
        return undefined;
    }

    if (ctrl.isCellRenderer()) {
        const colDef = ctrl.column.getColDef();
        // create rule for our internal group cell renderer
        const isGroupCellRenderer = !!colDef.showRowGroup || colDef.cellRenderer === 'agGroupCellRenderer';
        if (!isGroupCellRenderer) {
            return undefined;
        }

        return _isElementOverflowingCallback(() => {
            const eCell = ctrl.eGui;
            return (
                (eCell.querySelector('.ag-group-value') as HTMLElement | undefined) ||
                (eCell.querySelector('.ag-cell-value') as HTMLElement | undefined) ||
                eCell
            );
        });
    }

    return _isElementOverflowingCallback(() => {
        const eCell = ctrl.eGui;
        return eCell.children.length === 0 ? eCell : (eCell.querySelector('.ag-cell-value') as HTMLElement | undefined);
    });
};

const buildCellTooltipDisplayFunctions = (
    beans: BeanCollection,
    ctrl: CellCtrl,
    shouldDisplayTooltip?: () => boolean
): CellTooltipDisplayFunctions => {
    const { editSvc } = beans;
    const { column } = ctrl;
    const isCellTruncated = getCellTruncationCheck(beans, ctrl);

    const shouldDisplayCellTooltip = () => {
        if (editSvc?.isEditing(ctrl)) {
            return false;
        }
        if (!isCellTruncated) {
            return true;
        }
        if (!column.isTooltipEnabled()) {
            return false;
        }
        return isCellTruncated();
    };

    return {
        shouldDisplayDefault: shouldDisplayCellTooltip,
        shouldDisplayColumnTooltip: shouldDisplayCellTooltip,
        shouldDisplayCustomTooltip: shouldDisplayTooltip ?? shouldDisplayCellTooltip,
    };
};

const resolveCellTooltip = ({
    beans,
    ctrl,
    value,
    displayFunctions,
    translate,
}: {
    beans: BeanCollection;
    ctrl: CellCtrl;
    value?: string;
    displayFunctions: CellTooltipDisplayFunctions;
    translate: LocaleTextFunc;
}): ResolvedCellTooltip | null => {
    const { editSvc, formula, gos } = beans;
    const { column, rowNode } = ctrl;

    // 1) formula error tooltip has highest priority.
    if (formula?.active && column.isAllowFormula()) {
        const error = formula.getFormulaError(column, rowNode);
        if (error) {
            return {
                value: getErrorTooltipMessage(error, translate),
                location: 'cellFormula',
                shouldDisplay: () => !!formula?.getFormulaError(column, rowNode),
            };
        }
    }

    // 2) edit-model validation errors take priority when not editing.
    const isEditing = !!editSvc?.isEditing(ctrl);
    if (!isEditing) {
        const errorMessages = getEditErrorsForPosition(beans, ctrl, translate);
        if (errorMessages) {
            return {
                value: errorMessages,
                location: 'cellEditor',
                shouldDisplay: () => !editSvc?.isEditing(ctrl) && !!getEditErrorsForPosition(beans, ctrl, translate),
            };
        }
    }

    const { shouldDisplayCustomTooltip, shouldDisplayColumnTooltip } = displayFunctions;

    // 3) explicit value from cellRenderer params (setTooltip) wins over colDef tooltips.
    if (value != null) {
        return { value, location: 'cell', shouldDisplay: shouldDisplayCustomTooltip };
    }

    const colDef = column.getColDef();
    const data = rowNode.data;

    // 4) column tooltip field/valueGetter is the final fallback.
    if (colDef.tooltipField && _exists(data)) {
        return {
            value: _getValueUsingField(data, colDef.tooltipField, column.isTooltipFieldContainsDots()),
            location: 'cell',
            shouldDisplay: shouldDisplayColumnTooltip,
        };
    }

    const valueGetter = colDef.tooltipValueGetter;

    if (valueGetter) {
        return {
            value: valueGetter(
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
            ),
            location: 'cell',
            shouldDisplay: shouldDisplayColumnTooltip,
        };
    }

    return null;
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

        if (!ctrl.isAlive()) {
            return;
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
        if (!ctrl.isAlive()) {
            return;
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
        const { column, rowNode } = ctrl;
        const displayFunctions = buildCellTooltipDisplayFunctions(beans, ctrl, shouldDisplayTooltip);
        const translate = this.getLocaleTextFunc();
        let resolvedTooltip: ResolvedCellTooltip | null = null;

        const resolveAndStore = () => {
            resolvedTooltip = resolveCellTooltip({
                beans,
                ctrl,
                value,
                displayFunctions,
                translate,
            });
            return resolvedTooltip;
        };

        const getTooltipValue = () => resolveAndStore()?.value;

        const tooltipCtrl: ITooltipCtrl = {
            getGui: () => ctrl.eGui,
            getLocation: () => resolvedTooltip?.location ?? 'cell',
            getTooltipValue,
            shouldDisplayTooltip: () => {
                const tooltip = resolvedTooltip ?? resolveAndStore();
                if (!tooltip) {
                    return false;
                }
                return tooltip.shouldDisplay ? tooltip.shouldDisplay() : true;
            },
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
