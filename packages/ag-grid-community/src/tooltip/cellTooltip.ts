import type { LocaleTextFunc } from 'ag-stack';
import { _exists, _getLocaleTextFunc, _isElementOverflowingCallback } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import { _formatValidationMessages } from '../edit/utils/validationMessages';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { ICellEditor } from '../interfaces/iCellEditor';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { TooltipCallbackParams, TooltipLocation } from './tooltipComponent';
import type { TooltipSource } from './tooltipFeature';
import { _getCellTooltipComponentDefinition, _isShowTooltipWhenTruncated } from './tooltipFeature';
import { _getLegacyTooltipFieldValue, _isCellTooltipConfigured, _resolveCellTooltipValue } from './tooltipValueUtils';
import type { LegacyTooltipFieldResolution } from './tooltipValueUtils';

type ResolvedCellTooltip = {
    value: any;
    location: Extract<TooltipLocation, 'cell' | 'cellEditor' | 'cellFormula'>;
    componentDefinition: ColDef | undefined;
    shouldDisplay?: () => boolean;
};

type LocalisableError = Error & {
    getTranslatedMessage?: (translate: LocaleTextFunc) => string;
};

const getErrorTooltipMessage = (error: Error, translate: LocaleTextFunc): string => {
    const localisable = error as LocalisableError;
    return localisable.getTranslatedMessage?.(translate) ?? error.message;
};

const getEditErrors = (beans: BeanCollection, cellCtrl: CellCtrl, translate: LocaleTextFunc): string | undefined => {
    const cellErrors = beans.editModelSvc?.getCellValidationModel()?.getCellValidation(cellCtrl)?.errorMessages;
    const rowErrors = beans.editModelSvc?.getRowValidationModel().getRowValidation(cellCtrl)?.errorMessages;
    const errors = cellErrors?.length ? cellErrors : rowErrors;
    return errors?.length ? _formatValidationMessages(errors, translate, 'inline') : undefined;
};

const getOverflowTarget = (ctrl: CellCtrl): HTMLElement | undefined => {
    const eCell = ctrl.eGui;
    return eCell.children.length === 0 ? eCell : (eCell.querySelector('.ag-cell-value') as HTMLElement | undefined);
};

const getTruncationCheck = (beans: BeanCollection, ctrl: CellCtrl): (() => boolean) | undefined => {
    if (!_isShowTooltipWhenTruncated(beans.gos)) {
        return undefined;
    }

    if (!ctrl.isCellRenderer()) {
        return _isElementOverflowingCallback(() => getOverflowTarget(ctrl));
    }

    const colDef = ctrl.column.colDef;
    const isGroupRenderer = !!colDef.showRowGroup || colDef.cellRenderer === 'agGroupCellRenderer';
    if (!isGroupRenderer) {
        return ctrl.hasActiveCellRenderer() ? undefined : _isElementOverflowingCallback(() => getOverflowTarget(ctrl));
    }

    return _isElementOverflowingCallback(() => {
        const eCell = ctrl.eGui;
        return (
            (eCell.querySelector('.ag-group-value') as HTMLElement | undefined) ||
            (eCell.querySelector('.ag-cell-value') as HTMLElement | undefined) ||
            eCell
        );
    });
};

const shouldDisplayCellTooltip = (beans: BeanCollection, ctrl: CellCtrl, configuredOnly: boolean): boolean => {
    if (beans.editSvc?.isEditing(ctrl, { withOpenEditor: true })) {
        return false;
    }
    const truncationCheck = getTruncationCheck(beans, ctrl);
    if (!truncationCheck) {
        return true;
    }
    return (!configuredOnly || ctrl.column.isTooltipEnabled()) && truncationCheck();
};

const resolveLegacyFieldValue = (
    beans: BeanCollection,
    column: AgColumn,
    rowNode: RowNode
): LegacyTooltipFieldResolution => {
    const tooltipField = column.colDef.tooltipField;
    if (!tooltipField) {
        return { resolved: false };
    }

    const usesAggregate =
        rowNode.group &&
        (!rowNode.data ||
            (!beans.valueSvc.displayIgnoresAggData(rowNode) && rowNode.aggData?.[column.colId] !== undefined));
    if (usesAggregate) {
        return {
            resolved: true,
            value: beans.valueSvc.getValueForDisplay({
                column,
                node: rowNode,
                from: 'edit',
                transformValues: false,
            }).value,
        };
    }

    const data = rowNode.data;
    if (!_exists(data)) {
        return { resolved: false };
    }

    const tooltipColumn = beans.colModel.getCol(tooltipField);
    if (tooltipColumn) {
        const pendingValue = beans.editSvc?.getPendingEditValue(rowNode, tooltipColumn, 'batch');
        if (pendingValue !== undefined) {
            return { resolved: true, value: pendingValue };
        }
    }
    return {
        resolved: true,
        value: _getLegacyTooltipFieldValue(data, tooltipField, column.tooltipFieldContainsDots),
    };
};

const resolveCellTooltip = (
    beans: BeanCollection,
    ctrl: CellCtrl,
    translate: LocaleTextFunc
): ResolvedCellTooltip | null => {
    const { column, rowNode } = ctrl;
    const { editSvc, formula } = beans;

    if ((column.allowFormula && formula?.active) || (column.isCalculatedCol && formula)) {
        const error = formula.getFormulaError(column, rowNode);
        if (error) {
            return {
                value: getErrorTooltipMessage(error, translate),
                location: 'cellFormula',
                componentDefinition: column.colDef,
                shouldDisplay: () => !!formula.getFormulaError(column, rowNode),
            };
        }
    }

    if (!editSvc?.isEditing(ctrl)) {
        const errors = getEditErrors(beans, ctrl, translate);
        if (errors) {
            return {
                value: errors,
                location: 'cellEditor',
                componentDefinition: column.colDef,
                shouldDisplay: () => !editSvc?.isEditing(ctrl) && !!getEditErrors(beans, ctrl, translate),
            };
        }
    }

    if (ctrl.rendererTooltipValue != null) {
        return {
            value: ctrl.rendererTooltipValue,
            location: 'cell',
            componentDefinition: column.colDef,
            shouldDisplay: ctrl.rendererTooltipShouldDisplay ?? (() => shouldDisplayCellTooltip(beans, ctrl, false)),
        };
    }

    const colDef = column.colDef;
    if (!_isCellTooltipConfigured(colDef)) {
        return null;
    }

    const params = _addGridCommonParams<TooltipCallbackParams>(beans.gos, {
        location: 'cell' as const,
        colDef,
        column,
        rowIndex: ctrl.cellPosition.rowIndex,
        node: rowNode,
        data: rowNode.data,
        value: ctrl.value,
        valueFormatted: ctrl.valueFormatted,
    });
    return {
        value: _resolveCellTooltipValue(colDef, params, () => resolveLegacyFieldValue(beans, column, rowNode)),
        location: 'cell',
        componentDefinition: _getCellTooltipComponentDefinition(colDef),
        shouldDisplay: () => shouldDisplayCellTooltip(beans, ctrl, true),
    };
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _createCellTooltipSource(beans: BeanCollection, ctrl: CellCtrl): TooltipSource {
    const translate = _getLocaleTextFunc(beans.localeSvc);
    let resolved: ResolvedCellTooltip | null = null;

    const resolve = () => (resolved = resolveCellTooltip(beans, ctrl, translate));
    return {
        getGui: () => ctrl.eGui,
        getTooltipComponentDefinition: () => (resolved ?? resolve())?.componentDefinition,
        getTooltipValue: () => resolve()?.value,
        getLocation: () => resolved?.location ?? 'cell',
        shouldDisplayTooltip: () => {
            const current = resolved ?? resolve();
            return !!current && (current.shouldDisplay?.() ?? true);
        },
        getAdditionalParams: () => ({
            column: ctrl.column,
            colDef: ctrl.column.colDef,
            rowIndex: ctrl.cellPosition.rowIndex,
            node: ctrl.rowNode,
            data: ctrl.rowNode.data,
            valueFormatted: ctrl.valueFormatted,
        }),
    };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _createCellEditorTooltipSource(
    beans: BeanCollection,
    cellCtrl: CellCtrl,
    editor: ICellEditor
): TooltipSource | undefined {
    const eGui = editor.getValidationElement?.(true) || (!editor.isPopup?.() && cellCtrl.eGui);
    if (!eGui) {
        return undefined;
    }

    const translate = _getLocaleTextFunc(beans.localeSvc);
    return {
        getGui: () => eGui,
        getTooltipComponentDefinition: () => cellCtrl.column.colDef,
        getTooltipValue: () => getEditErrors(beans, cellCtrl, translate),
        getLocation: () => 'cellEditor',
        shouldDisplayTooltip: () => {
            const rowErrors = beans.editModelSvc?.getRowValidationModel()?.getRowValidationMap();
            const cellErrors = beans.editModelSvc?.getCellValidationModel()?.getCellValidationMap();
            return !!rowErrors?.size || !!cellErrors?.size;
        },
        getAdditionalParams: () => ({
            column: cellCtrl.column,
            colDef: cellCtrl.column.colDef,
            rowIndex: cellCtrl.cellPosition.rowIndex,
            node: cellCtrl.rowNode,
            data: cellCtrl.rowNode.data,
        }),
    };
}
