import { userEvent } from '@testing-library/user-event';

import type { ColDef, GridApi, IRowNode } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule, UndoRedoEditModule } from 'ag-grid-community';
import { RowGroupingModule, SetFilterModule, TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../../test-utils';
import { expect } from '../../test-utils/matchers';

export const gridsManager = new TestGridsManager({
    modules: [
        AllCommunityModule,
        ClientSideRowModelModule,
        RowGroupingModule,
        TreeDataModule,
        UndoRedoEditModule,
        SetFilterModule,
    ],
});

export const EDIT_MODES = ['ui', 'setDataValue'] as const;

export type EditableCallback = Exclude<NonNullable<ColDef['editable']>, boolean>;
export type GroupRowEditableCallback = Exclude<NonNullable<ColDef['groupRowEditable']>, boolean>;
export type ValueSetterCallback = Extract<NonNullable<ColDef['valueSetter']>, (...args: any[]) => any>;
export type ValueParserCallback = Extract<NonNullable<ColDef['valueParser']>, (...args: any[]) => any>;

function locateCellElements(api: GridApi, rowNode: IRowNode, colId: string) {
    const gridDiv = TestGridsManager.getHTMLElement(api);
    expect(gridDiv).not.toBeNull();

    const rowId = rowNode.id;
    expect(rowId).toBeDefined();

    const rowIndex = rowNode.rowIndex;
    expect(rowIndex).not.toBeNull();

    let cell = gridDiv!.querySelector<HTMLElement>(`[row-id="${rowId}"] [col-id="${colId}"]`);
    if (!cell && rowIndex != null) {
        const rowElement = gridDiv!.querySelector<HTMLElement>(`.ag-row[aria-rowindex="${rowIndex + 1}"]`);
        cell = rowElement?.querySelector<HTMLElement>(`[col-id="${colId}"]`) ?? null;
    }
    expect(cell).not.toBeNull();

    return { gridDiv: gridDiv!, cell: cell!, rowIndex: rowIndex! };
}

export async function editCell(api: GridApi, rowNode: IRowNode, colId: string, newValue: string) {
    const { gridDiv, cell, rowIndex } = locateCellElements(api, rowNode, colId);

    await userEvent.click(cell);

    api.setFocusedCell(rowIndex, colId);
    api.startEditingCell({ rowIndex, rowPinned: rowNode.rowPinned, colKey: colId });

    const input = await waitForInput(gridDiv, cell ?? gridDiv);
    await userEvent.clear(input);
    await userEvent.type(input, `${newValue}{Enter}`);
    await asyncSetTimeout(0);

    return cell;
}

export function getGroupColumnDisplayValue(rowNode: IRowNode): string | undefined {
    const groupValue = rowNode.groupData?.group;
    if (groupValue !== undefined) {
        return groupValue;
    }
    const data = rowNode.data as { label?: string } | undefined;
    return data?.label;
}

export type CallbackArgs =
    | Parameters<EditableCallback>
    | Parameters<GroupRowEditableCallback>
    | Parameters<ValueSetterCallback>;

export function callsForRowNode(calls: CallbackArgs[], rowId?: string | null) {
    if (!rowId) {
        return [] as CallbackArgs[];
    }
    return calls.filter(([params]) => params?.node?.id === rowId);
}

export { asyncSetTimeout };
