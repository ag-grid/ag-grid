import type { _EditGridApi } from '../api/gridApi';
import type { DefaultProvidedCellEditorParams } from '../interfaces/iCellEditor';
import { defineCommunityModule } from '../interfaces/iModule';
import { UndoRedoService } from '../undoRedo/undoRedoService';
import { PopupModule } from '../widgets/popupModule';
import { CheckboxCellEditor } from './cellEditors/checkboxCellEditor';
import { DateCellEditor } from './cellEditors/dateCellEditor';
import { DateStringCellEditor } from './cellEditors/dateStringCellEditor';
import { LargeTextCellEditor } from './cellEditors/largeTextCellEditor';
import { NumberCellEditor } from './cellEditors/numberCellEditor';
import { SelectCellEditor } from './cellEditors/selectCellEditor';
import { TextCellEditor } from './cellEditors/textCellEditor';
import {
    getCellEditorInstances,
    getCurrentRedoSize,
    getCurrentUndoSize,
    getEditingCells,
    redoCellEditing,
    startEditingCell,
    stopEditing,
    undoCellEditing,
} from './editApi';
import { EditService } from './editService';
import { RowEditService } from './rowEditService';

export const EditCoreModule = defineCommunityModule('@ag-grid-community/edit-core', {
    beans: [EditService],
    dependsOn: [PopupModule],
});

export const EditApiModule = defineCommunityModule<_EditGridApi<any>>('@ag-grid-community/edit-api', {
    apiFunctions: {
        undoCellEditing,
        redoCellEditing,
        getCellEditorInstances,
        getEditingCells,
        stopEditing,
        startEditingCell,
        getCurrentUndoSize,
        getCurrentRedoSize,
    },
    dependsOn: [EditCoreModule],
});

export const UndoRedoEditModule = defineCommunityModule('@ag-grid-community/undo-redo-edit', {
    beans: [UndoRedoService],
    dependsOn: [EditCoreModule],
});

export const FullRowEditModule = defineCommunityModule('@ag-grid-community/full-row-edit', {
    beans: [RowEditService],
    dependsOn: [EditCoreModule],
});

export const DefaultEditorModule = defineCommunityModule('@ag-grid-community/default-editor', {
    userComponents: [{ name: 'agCellEditor', classImp: TextCellEditor }],
    dependsOn: [EditCoreModule],
});

export const DataTypeEditorsModule = defineCommunityModule('@ag-grid-community/data-type-editors', {
    userComponents: [
        { name: 'agTextCellEditor', classImp: TextCellEditor },
        {
            name: 'agNumberCellEditor',
            classImp: NumberCellEditor,
            params: {
                suppressPreventDefault: true,
            } as DefaultProvidedCellEditorParams,
        },
        { name: 'agDateCellEditor', classImp: DateCellEditor },
        { name: 'agDateStringCellEditor', classImp: DateStringCellEditor },
        { name: 'agCheckboxCellEditor', classImp: CheckboxCellEditor },
    ],
    dependsOn: [DefaultEditorModule],
});

export const SelectEditorModule = defineCommunityModule('@ag-grid-community/select-editor', {
    userComponents: [{ name: 'agSelectCellEditor', classImp: SelectCellEditor }],
    dependsOn: [EditCoreModule],
});

export const LargeTextEditorModule = defineCommunityModule('@ag-grid-community/large-text-editor', {
    userComponents: [{ name: 'agLargeTextCellEditor', classImp: LargeTextCellEditor }],
    dependsOn: [EditCoreModule],
});

const AllCommunityEditorsModule = defineCommunityModule('@ag-grid-community/all-editors', {
    dependsOn: [DefaultEditorModule, DataTypeEditorsModule, SelectEditorModule, LargeTextEditorModule],
});

export const EditModule = defineCommunityModule('@ag-grid-community/editing', {
    dependsOn: [EditCoreModule, UndoRedoEditModule, FullRowEditModule, AllCommunityEditorsModule, EditApiModule],
});
