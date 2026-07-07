import type { AiToolResult, BeanCollection, CalculatedColumnDef, ColDef, ColGroupDef } from 'ag-grid-community';

import { s } from '../schemaBuilder';
import type { JSONSchema } from '../schemaTypes';
import type { AiTool } from './toolTypes';

interface CreateCalculatedColumnArgs {
    colId: string;
    headerName: string;
    calculatedExpression: string;
    cellDataType?: string | null;
}

function buildExpressionGuidance(beans: BeanCollection): string {
    const columnIds = beans.colModel.colsList.map((col) => col.colId);
    const functionNames = beans.formula?.getFunctionNames() ?? [];
    const parts = [
        'Formula for the column value. Reference other columns with square brackets, e.g. [gold] + [silver].',
    ];
    if (columnIds.length) {
        parts.push(`Available columns: ${columnIds.join(', ')}.`);
    }
    if (functionNames.length) {
        parts.push(`Available functions: ${functionNames.join(', ')}.`);
    }
    return parts.join(' ');
}

function build(beans: BeanCollection): JSONSchema | undefined {
    const { calculatedColsSvc } = beans;
    if (!calculatedColsSvc?.isEnabled()) {
        return undefined;
    }

    const dataTypes = calculatedColsSvc.getAllowedDataTypes();
    const cellDataType = dataTypes.length
        ? s.enum(dataTypes, 'Result data type of the column.')
        : s.string('Result data type of the column.');

    const existingColumnIds = beans.colModel.colsList.map((col) => col.colId);

    return s
        .object(
            {
                colId: s.string(
                    `Unique identifier for the new column, e.g. "medalTotal". Must not match an existing column id: ${existingColumnIds.join(', ')}.`
                ),
                headerName: s.string('Column header text shown to users.'),
                calculatedExpression: s.string(buildExpressionGuidance(beans)),
                cellDataType: cellDataType.nullable(),
            },
            'Create a new calculated column whose values are derived from a formula.'
        )
        .toJSON();
}

function execute(beans: BeanCollection, args: unknown): AiToolResult {
    const { calculatedColsSvc, colModel, formula, gos } = beans;
    if (!calculatedColsSvc?.isEnabled()) {
        return { ok: false, error: 'Calculated columns are not enabled' };
    }

    const { colId, headerName, calculatedExpression, cellDataType } = (args ?? {}) as CreateCalculatedColumnArgs;
    if (!colId || !headerName || !calculatedExpression) {
        return { ok: false, error: 'colId, headerName and calculatedExpression are all required' };
    }
    if (colModel.colsById[colId] != null) {
        return { ok: false, error: `A column with id "${colId}" already exists` };
    }

    const formulaError = formula?.validateExpression(`=${calculatedExpression}`);
    if (formulaError) {
        return { ok: false, error: `Invalid expression: ${formulaError.message}` };
    }

    const newColDef: CalculatedColumnDef = { colId, headerName, calculatedExpression };
    if (cellDataType) {
        newColDef.cellDataType = cellDataType;
    }

    const existingColumnDefs: (ColDef | ColGroupDef)[] = gos.get('columnDefs') ?? [];
    gos.updateGridOptions({ options: { columnDefs: [...existingColumnDefs, newColDef] } });

    return { ok: true, summary: `Created calculated column "${headerName}"` };
}

export const createCalculatedColumnTool: AiTool = {
    name: 'add_calculated_column',
    description: 'Add a new calculated column to the grid, derived from a formula over existing columns.',
    build,
    execute,
};
