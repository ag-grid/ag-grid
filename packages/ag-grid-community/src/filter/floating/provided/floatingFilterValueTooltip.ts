import { _getActiveDomElement, _isElementOverflowingCallback } from 'ag-stack';

import type { BeanCollection } from '../../../context/context';
import type { AgColumn } from '../../../entities/agColumn';
import type { Column } from '../../../interfaces/iColumn';
import type { Component } from '../../../widgets/component';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _addFloatingFilterValueTooltip(
    component: Component,
    beans: BeanCollection,
    getColumn: () => Column,
    input: GridInputTextField | (() => HTMLInputElement | null | undefined),
    getTooltipValue?: () => string | null | undefined
): (() => void) | undefined {
    if (!beans.tooltipSvc) {
        return;
    }
    const field = typeof input === 'function' ? undefined : input;
    const getInput = typeof input === 'function' ? input : () => input.getInputElement();
    const getValue = getTooltipValue ?? (() => getInput()?.value);
    const owner = field ?? component;
    const getElement = () => getInput() ?? owner.getGui();
    const header = beans.ctrlsSvc
        .getHeaderRowContainerCtrl()
        ?.getFloatingFilterCtrlForColumn(getColumn() as AgColumn)?.eGui;
    const isTruncated = _isElementOverflowingCallback(getElement);
    let tooltipValue: string | null | undefined;
    const tooltip = owner.addTooltip({
        control: 'floatingFilterValue',
        getFocusElement: () => header ?? owner.getGui(),
        getAriaElement: () => (getInput()?.disabled && header ? header : getElement()),
        shouldDisplayTooltipOnFocus: () => {
            const activeElement = _getActiveDomElement(beans);
            const input = getInput();
            return activeElement === input || (input?.disabled === true && activeElement === header);
        },
        getLocation: () => 'floatingFilter',
        getTooltip: () => {
            const truncated = isTruncated();
            if (truncated) {
                tooltipValue ??= getValue();
            }
            return { value: truncated ? tooltipValue : null, params: { column: getColumn() } };
        },
    });
    if (!tooltip) {
        return;
    }

    let previousInput = getInput();
    let previousValue = previousInput?.value ?? '';
    const refresh = () => {
        const currentInput = getInput();
        const value = currentInput?.value ?? '';
        // A model-derived tooltip can change while its abbreviated input stays the same.
        if (getTooltipValue || previousInput !== currentInput || previousValue !== value) {
            previousInput = currentInput;
            previousValue = value;
            tooltipValue = undefined;
            tooltip.refreshTooltip();
        }
    };
    // Model-derived previews are refreshed by their owner, not by the abbreviated input.
    if (!getTooltipValue) {
        owner.addManagedListeners(owner.getGui(), { input: refresh });
        if (field) {
            owner.addManagedListeners(field, { fieldValueChanged: refresh, fieldValueCleared: refresh });
        }
    }
    return refresh;
}
