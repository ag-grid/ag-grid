import type { LocaleTextFunc } from 'ag-stack';
import { _exists, _getLocaleTextFunc } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import { _formatValidationMessages } from '../edit/utils/validationMessages';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { ICellEditor } from '../interfaces/iCellEditor';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { TooltipCallbackParams, TooltipLocation } from './tooltipComponent';
import type { ResolvedTooltip, TooltipSource, TooltipSourceParams } from './tooltipFeature';
import { _getCellTooltipComponentDefinition, _resolveTextTooltip, getGroupTooltipTextElement } from './tooltipFeature';
import { _getLegacyTooltipFieldValue, _isCellTooltipConfigured, _resolveCellTooltipValue } from './tooltipValueUtils';
import type { LegacyTooltipFieldResolution } from './tooltipValueUtils';

export type ResolvedCellTooltip = ResolvedTooltip & {
    location: Extract<TooltipLocation, 'cell' | 'cellEditor' | 'cellFormula'>;
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
    return eCell.classList.contains('ag-cell-value')
        ? eCell
        : (eCell.querySelector<HTMLElement>('.ag-cell-value') ?? undefined);
};

const getTextElement = (ctrl: CellCtrl): HTMLElement | undefined => {
    if (!ctrl.hasConfiguredCellRenderer()) {
        return getOverflowTarget(ctrl);
    }

    return getGroupTooltipTextElement(getOverflowTarget(ctrl), ':scope > ');
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
        value: _getLegacyTooltipFieldValue(data, tooltipField, column.isTooltipFieldContainsDots()),
    };
};

const resolveCellTooltip = (
    beans: BeanCollection,
    ctrl: CellCtrl,
    translate: LocaleTextFunc,
    sourceParams: TooltipSourceParams
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

    return beans.tooltipSvc?.resolveCellTooltip(ctrl, sourceParams) ?? null;
};

export function _resolveConfiguredCellTooltip(
    beans: BeanCollection,
    ctrl: CellCtrl,
    sourceParams: TooltipSourceParams
): ResolvedCellTooltip | null {
    const { column, rowNode } = ctrl;
    if (ctrl.rendererTooltipValue != null) {
        return {
            ..._resolveTextTooltip(beans.gos, {
                value: ctrl.rendererTooltipValue,
                params: sourceParams,
                componentDefinition: column.colDef,
                shouldDisplay: ctrl.rendererTooltipShouldDisplay,
            }),
            location: 'cell',
        };
    }

    const colDef = column.colDef;
    const tooltipColDef = beans.autoColSvc?.getTooltipColDef(column, rowNode) ?? colDef;
    if (tooltipColDef.tooltip === false) {
        return null;
    }

    const params = _addGridCommonParams<TooltipCallbackParams>(beans.gos, {
        ...sourceParams,
        location: 'cell' as const,
    });
    return {
        ..._resolveTextTooltip(beans.gos, {
            value: _resolveCellTooltipValue(colDef, params, () => resolveLegacyFieldValue(beans, column, rowNode)),
            automatic: !_isCellTooltipConfigured(tooltipColDef),
            params: sourceParams,
            componentDefinition: _getCellTooltipComponentDefinition(colDef),
        }),
        location: 'cell',
    };
}

export function _createCellTooltipSource(beans: BeanCollection, ctrl: CellCtrl): TooltipSource {
    const translate = _getLocaleTextFunc(beans.localeSvc);
    return {
        getGui: () => ctrl.eGui,
        getTextElement: () => getTextElement(ctrl),
        getTooltip: () => {
            const params = {
                column: ctrl.column,
                colDef: ctrl.column.colDef,
                rowIndex: ctrl.cellPosition.rowIndex,
                node: ctrl.rowNode,
                data: ctrl.rowNode.data,
                value: ctrl.value,
                valueFormatted: ctrl.valueFormatted,
            };
            const tooltip = resolveCellTooltip(beans, ctrl, translate, params);
            return {
                value: undefined,
                ...tooltip,
                params,
                sourceValues:
                    tooltip && tooltip.location !== 'cell'
                        ? { value: tooltip.value, valueFormatted: undefined }
                        : undefined,
            };
        },
        getLocation: () => 'cell',
        shouldDisplayTooltip: (tooltip) =>
            tooltip.location !== 'cell' || !beans.editSvc?.isEditing(ctrl, { withOpenEditor: true }),
    };
}

export function _createCellEditorTooltipSource(
    beans: BeanCollection,
    cellCtrl: CellCtrl,
    editor: ICellEditor
): TooltipSource | undefined {
    const eGui = editor.getValidationElement?.(true) ?? (!editor.isPopup?.() && cellCtrl.eGui);
    if (!eGui) {
        return undefined;
    }

    const translate = _getLocaleTextFunc(beans.localeSvc);
    return {
        getGui: () => eGui,
        getTooltip: () => ({
            value: getEditErrors(beans, cellCtrl, translate),
            componentDefinition: cellCtrl.column.colDef,
            params: {
                column: cellCtrl.column,
                colDef: cellCtrl.column.colDef,
                rowIndex: cellCtrl.cellPosition.rowIndex,
                node: cellCtrl.rowNode,
                data: cellCtrl.rowNode.data,
            },
        }),
        getLocation: () => 'cellEditor',
        shouldDisplayTooltip: () => {
            const rowErrors = beans.editModelSvc?.getRowValidationModel()?.getRowValidationMap();
            const cellErrors = beans.editModelSvc?.getCellValidationModel()?.getCellValidationMap();
            return !!rowErrors?.size || !!cellErrors?.size;
        },
    };
}
