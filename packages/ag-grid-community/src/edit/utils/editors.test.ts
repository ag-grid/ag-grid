import type { BeanCollection } from '../../context/context';
import type { ICellEditor } from '../../interfaces/iCellEditor';
import type { Column } from '../../interfaces/iColumn';
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import { UNEDITED, _collectEditorValidationCache, _syncFromEditorComp } from './editors';

describe('editor validation cache identity', () => {
    test('does not apply a collected verdict to a replacement editor at the same position', () => {
        const rowNode = {} as IRowNode;
        const column = { getColId: () => 'value' } as Column;
        const position = { rowNode, column } satisfies Required<EditPosition>;
        const originalEditor = {
            getValidationErrors: vi.fn(() => null),
            getValue: vi.fn(() => 'original'),
        } as ICellEditor;
        const replacementEditor = {
            getValidationErrors: vi.fn(() => ['replacement is invalid']),
            getValue: vi.fn(() => 'replacement'),
        } as ICellEditor;
        let currentEditor = originalEditor;
        let edit = {
            sourceValue: 'source',
            pendingValue: UNEDITED,
            editorValue: 'source',
            state: 'editing',
            editorState: {},
        } as EditValue;
        const cellCtrl = { comp: { getCellEditor: () => currentEditor } };
        const rowCtrl = { getCellCtrl: () => cellCtrl };
        const setEdit = vi.fn((_position: Required<EditPosition>, update: Partial<EditValue>) => {
            edit = { ...edit, ...update };
            return edit;
        });
        const beans = {
            colModel: { getCol: () => column },
            editModelSvc: {
                getEdit: () => edit,
                setEdit,
            },
            editSvc: { hasValidationRules: () => true },
            rowRenderer: {
                getCellCtrls: () => [cellCtrl],
                getRowCtrlByNode: () => rowCtrl,
            },
        } as unknown as BeanCollection;

        const validationCache = _collectEditorValidationCache(beans);
        currentEditor = replacementEditor;

        _syncFromEditorComp(beans, position, { persist: false }, validationCache);

        expect(validationCache.get(originalEditor)).toEqual([]);
        expect(validationCache.has(replacementEditor)).toBe(false);
        expect(originalEditor.getValidationErrors).toHaveBeenCalledOnce();
        expect(replacementEditor.getValidationErrors).toHaveBeenCalledOnce();
        expect(replacementEditor.getValue).not.toHaveBeenCalled();
        expect(setEdit).toHaveBeenLastCalledWith(position, { editorValue: 'source' });
    });
});
