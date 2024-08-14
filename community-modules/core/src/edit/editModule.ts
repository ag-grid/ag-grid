import type { _EditGridApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { UndoRedoService } from '../undoRedo/undoRedoService';
import { VERSION } from '../version';
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

export const EditCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/edit-core',
    beans: [EditService],
});

export const EditApiModule = _defineModule<_EditGridApi<any>>({
    version: VERSION,
    moduleName: '@ag-grid-community/edit-api',
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
    dependantModules: [EditCoreModule],
});

export const UndoRedoEditModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/undo-redo-edit',
    beans: [UndoRedoService],
    dependantModules: [EditCoreModule],
});

export const FullRowEditModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/full-row-edit',
    beans: [RowEditService],
    dependantModules: [EditCoreModule],
});

export const DefaultEditorModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/default-editor',
    userComponents: [{ name: 'agCellEditor', classImp: TextCellEditor }],
    dependantModules: [EditCoreModule],
});

export const DataTypeEditorsModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/data-type-editors',
    userComponents: [
        { name: 'agTextCellEditor', classImp: TextCellEditor },
        { name: 'agNumberCellEditor', classImp: NumberCellEditor },
        { name: 'agDateCellEditor', classImp: DateCellEditor },
        { name: 'agDateStringCellEditor', classImp: DateStringCellEditor },
        { name: 'agCheckboxCellEditor', classImp: CheckboxCellEditor },
    ],
    dependantModules: [DefaultEditorModule],
});

export const SelectEditorModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/select-editor',
    userComponents: [{ name: 'agSelectCellEditor', classImp: SelectCellEditor }],
    dependantModules: [EditCoreModule],
});

export const LargeTextEditorModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/large-text-editor',
    userComponents: [{ name: 'agLargeTextCellEditor', classImp: LargeTextCellEditor }],
    dependantModules: [EditCoreModule],
});

const AllCommunityEditorsModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/all-editors',
    dependantModules: [DefaultEditorModule, DataTypeEditorsModule, SelectEditorModule, LargeTextEditorModule],
});

export const EditModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/editing',
    dependantModules: [EditCoreModule, UndoRedoEditModule, FullRowEditModule, AllCommunityEditorsModule, EditApiModule],
});
