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

export const EditCoreModule = defineCommunityModule('EditCoreModule', {
    beans: [EditService],
    dependsOn: [PopupModule],
});

export const EditApiModule = defineCommunityModule<_EditGridApi<any>>('EditApiModule', {
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

export const UndoRedoEditModule = defineCommunityModule('UndoRedoEditModule', {
    beans: [UndoRedoService],
    dependsOn: [EditCoreModule],
});

export const FullRowEditModule = defineCommunityModule('FullRowEditModule', {
    beans: [RowEditService],
    dependsOn: [EditCoreModule],
});

export const DefaultEditorModule = defineCommunityModule('DefaultEditorModule', {
    userComponents: [{ name: 'agCellEditor', classImp: TextCellEditor }],
    dependsOn: [EditCoreModule],
});

export const DataTypeEditorsModule = defineCommunityModule('DataTypeEditorsModule', {
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

export const SelectEditorModule = defineCommunityModule('SelectEditorModule', {
    userComponents: [{ name: 'agSelectCellEditor', classImp: SelectCellEditor }],
    dependsOn: [EditCoreModule],
});

export const LargeTextEditorModule = defineCommunityModule('LargeTextEditorModule', {
    userComponents: [{ name: 'agLargeTextCellEditor', classImp: LargeTextCellEditor }],
    dependsOn: [EditCoreModule],
});

const AllCommunityEditorsModule = defineCommunityModule('AllCommunityEditorsModule', {
    dependsOn: [DefaultEditorModule, DataTypeEditorsModule, SelectEditorModule, LargeTextEditorModule],
});

export const EditModule = defineCommunityModule('EditModule', {
    dependsOn: [EditCoreModule, UndoRedoEditModule, FullRowEditModule, AllCommunityEditorsModule, EditApiModule],
});
