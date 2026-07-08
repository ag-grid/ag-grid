import { userEvent } from '@testing-library/user-event';

import type { ColDef, GridApi, IRowNode } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule, UndoRedoEditModule } from 'ag-grid-community';
import { RowGroupingEditModule, RowGroupingModule, SetFilterModule, TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../../test-utils';

export const gridsManager = new TestGridsManager({
    modules: [
        AllCommunityModule,
        ClientSideRowModelModule,
        RowGroupingModule,
        TreeDataModule,
        UndoRedoEditModule,
        SetFilterModule,
        RowGroupingEditModule,
    ],
});

export const EDIT_MODES = ['ui', 'setDataValue'] as const;

export type EditableCallback = Exclude<NonNullable<ColDef['editable']>, boolean>;
export type GroupRowEditableCallback = Exclude<NonNullable<ColDef['groupRowEditable']>, boolean>;
export type GroupRowValueSetterCallback = Extract<NonNullable<ColDef['groupRowValueSetter']>, (...args: any[]) => any>;
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
    const { gridDiv, rowIndex } = locateCellElements(api, rowNode, colId);

    api.setFocusedCell(rowIndex, colId, rowNode.rowPinned ?? undefined);
    api.startEditingCell({ rowIndex, rowPinned: rowNode.rowPinned, colKey: colId });
    await asyncSetTimeout(0);

    // Re-query the cell after startEditingCell — in jsdom, `ensureIndexVisible` can
    // trigger a row redraw that replaces cell DOM elements, making the original reference stale.
    // Scope the input lookup to this cell rather than the whole grid: when edits happen in
    // sequence a previous editor's input can briefly linger in the DOM, and a grid-wide lookup
    // would grab that stale input instead of the one just opened, silently dropping the edit.
    const { cell } = locateCellElements(api, rowNode, colId);
    const input = await waitForInput(gridDiv, cell);
    await userEvent.clear(input);
    await userEvent.type(input, `${newValue}{Enter}`);
    await asyncSetTimeout(0);
}

/**
 * Performs an edit on a cell via either UI or setDataValue.
 * Handles jsdom cell DOM replacement that occurs during `startEditingCell`.
 */
export async function performEdit(
    editMode: string,
    api: GridApi,
    node: IRowNode,
    colId: string,
    value: number | string
) {
    if (editMode === 'ui') {
        await editCell(api, node, colId, `${value}`);
    } else {
        node.setDataValue(colId, typeof value === 'string' ? Number(value) : value, 'ui');
        await asyncSetTimeout(0);
    }
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
    | Parameters<ValueSetterCallback>
    | Parameters<GroupRowValueSetterCallback>;

export function callsForRowNode(calls: CallbackArgs[], rowId?: string | null) {
    if (!rowId) {
        return [] as CallbackArgs[];
    }
    return calls.filter(([params]) => (params as { node?: { id?: string } })?.node?.id === rowId);
}

export function createGroupRowData() {
    return [
        { id: 'fr-paris', region: 'Europe', country: 'France', amount: 30 },
        { id: 'fr-lyon', region: 'Europe', country: 'France', amount: 30 },
        { id: 'de-berlin', region: 'Europe', country: 'Germany', amount: 30 },
        { id: 'de-hamburg', region: 'Europe', country: 'Germany', amount: 30 },
        { id: 'it-rome', region: 'Europe', country: 'Italy', amount: 30 },
        { id: 'it-milan', region: 'Europe', country: 'Italy', amount: 30 },
        { id: 'us-nyc', region: 'Americas', country: 'USA', amount: 70 },
        { id: 'us-la', region: 'Americas', country: 'USA', amount: 30 },
        { id: 'ca-toronto', region: 'Americas', country: 'Canada', amount: 35 },
        { id: 'ca-vancouver', region: 'Americas', country: 'Canada', amount: 25 },
    ];
}

export const cascadeGroupRowValueSetter: GroupRowValueSetterCallback = ({
    aggregatedChildren,
    column,
    newValue,
    eventSource,
}) => {
    const numericValue = Number(newValue);
    if (!Number.isFinite(numericValue)) {
        return;
    }

    if (aggregatedChildren.length) {
        const perChild = numericValue / aggregatedChildren.length;
        for (const child of aggregatedChildren) {
            child.setDataValue(column, perChild, eventSource);
        }
    }
};

export { asyncSetTimeout };
