import { ROW_NUMBERS_COLUMN_ID, SELECTION_COLUMN_ID } from 'ag-grid-community';

import { createCalculatedColumnReferenceMapper } from './calculatedColumnReferenceMapper';

const createGroup = (name: string, parent: any = null) => ({
    __name: name,
    getGroupId: () => name,
    getOriginalParent: () => parent,
    isPadding: () => false,
});

const createColumn = (colId: string, headerName: string, groupNames: string[] = []) => {
    let parent: any = null;
    for (let i = groupNames.length - 1; i >= 0; i--) {
        parent = createGroup(groupNames[i], parent);
    }
    let colKind = 'user';
    if (colId === SELECTION_COLUMN_ID) {
        colKind = 'selection';
    } else if (colId === ROW_NUMBERS_COLUMN_ID) {
        colKind = 'row-number';
    }
    return {
        __headerName: headerName,
        colKind,
        getColId: () => colId,
        getOriginalParent: () => parent,
    } as any;
};

const mockBeans = {
    colNames: {
        getDisplayNameForColumn: (column: any) => column.__headerName,
        getDisplayNameForProvidedColumnGroup: (_columnGroup: any, providedColumnGroup: any) =>
            providedColumnGroup?.__name ?? null,
    },
} as any;

describe('createCalculatedColumnReferenceMapper', () => {
    test('display reference mapper qualifies duplicate headers and validates display references', () => {
        const duplicateFullPathMapper = createCalculatedColumnReferenceMapper(
            mockBeans,
            [createColumn('q4-a', 'Q4', ['2025']), createColumn('q4-b', 'Q4', ['2025'])],
            'calculated_1'
        );
        expect(duplicateFullPathMapper.suggestions.map(({ label }) => label)).toEqual([
            '2025 Q4 (q4-a)',
            '2025 Q4 (q4-b)',
        ]);

        const groupedMapper = createCalculatedColumnReferenceMapper(
            mockBeans,
            [createColumn('q4-2025', 'Q4', ['2025']), createColumn('q4-2026', 'Q4', ['2026'])],
            'calculated_1'
        );

        expect(groupedMapper.suggestions.map(({ label }) => label)).toEqual(['2025 Q4', '2026 Q4']);
        expect(groupedMapper.suggestions.map(({ displayPath }) => displayPath)).toEqual([
            ['2025', 'Q4'],
            ['2026', 'Q4'],
        ]);
        expect(groupedMapper.toInternalExpression('[Q4]')).toEqual({
            error: { type: 'ambiguous', reference: 'Q4' },
        });
        expect(groupedMapper.toInternalExpression('[Missing]')).toEqual({
            error: { type: 'unknown', reference: 'Missing' },
        });
        expect(groupedMapper.toInternalExpression('[2025 Q4] - [2026 Q4]')).toEqual({
            expression: '[q4-2025] - [q4-2026]',
        });
        expect(groupedMapper.toDisplayExpression('[q4-2025] - [q4-2026]')).toBe('[2025 Q4] - [2026 Q4]');
    });

    test('duplicate full-path suffix is stable across column reorder', () => {
        const colA = createColumn('q4-a', 'Q4', ['2025']);
        const colB = createColumn('q4-b', 'Q4', ['2025']);

        const forward = createCalculatedColumnReferenceMapper(mockBeans, [colA, colB], 'calculated_1');
        const reversed = createCalculatedColumnReferenceMapper(mockBeans, [colB, colA], 'calculated_1');

        expect(forward.suggestions.map(({ label }) => label)).toEqual(['2025 Q4 (q4-a)', '2025 Q4 (q4-b)']);
        expect(reversed.suggestions.map(({ label }) => label)).toEqual(['2025 Q4 (q4-b)', '2025 Q4 (q4-a)']);
    });

    test('reference suffix escapes special characters in colId', () => {
        const mapper = createCalculatedColumnReferenceMapper(
            mockBeans,
            [createColumn('weird/name', 'Total'), createColumn('plain', 'Total')],
            'calculated_1'
        );

        const [first, second] = mapper.suggestions.map(({ label }) => label);
        expect(first.includes(']')).toBe(false);
        expect(mapper.toInternalExpression(`[${first}] + [${second}]`)).toEqual({
            expression: '[weird/name] + [plain]',
        });
    });

    test('special columns are excluded from display references', () => {
        const mapper = createCalculatedColumnReferenceMapper(
            mockBeans,
            [
                createColumn(SELECTION_COLUMN_ID, 'Selection'),
                createColumn(ROW_NUMBERS_COLUMN_ID, 'Row Number'),
                createColumn('revenue', 'Revenue'),
            ],
            'calculated_1'
        );

        expect(mapper.suggestions.map(({ label }) => label)).toEqual(['Revenue']);
        expect(mapper.toInternalExpression('[Selection] + [Row Number]')).toEqual({
            error: { type: 'unknown', reference: 'Selection' },
        });
    });
});
