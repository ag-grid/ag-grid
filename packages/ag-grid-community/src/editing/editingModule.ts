import type { _EditingGridApi, _UndoRedoGridApi } from '../api/gridApi';
import { CheckboxCellEditor } from '../edit/cellEditors/checkboxCellEditor';
import { DateCellEditor } from '../edit/cellEditors/dateCellEditor';
import { DateStringCellEditor } from '../edit/cellEditors/dateStringCellEditor';
import { LargeTextCellEditor } from '../edit/cellEditors/largeTextCellEditor';
import { NumberCellEditor } from '../edit/cellEditors/numberCellEditor';
import { SelectCellEditor } from '../edit/cellEditors/selectCellEditor';
import { TextCellEditor } from '../edit/cellEditors/textCellEditor';
import type { DefaultProvidedCellEditorParams } from '../interfaces/iCellEditor';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { UndoRedoService } from '../undoRedo/undoRedoService';
import { VERSION } from '../version';
import { cellEditingCSS } from './cell-editing.css-GENERATED';
import {
    cancelEdits,
    getCellEditorInstances,
    getCurrentRedoSize,
    getCurrentUndoSize,
    getEditingCells,
    isEditing,
    redoCellEditing,
    startEditingCell,
    stopEditing,
    undoCellEditing,
} from './editingApi';
import { EditingService } from './editingService';
import { FullRowEditStrategy } from './strategy/fullRowEditStrategy';
import { SingleCellEditStrategy } from './strategy/singleCellEditStrategy';

/**
 * @internal
 */
export const EditingCoreModule: _ModuleWithApi<_EditingGridApi<any>> = {
    moduleName: 'EditingCore',
    version: VERSION,
    beans: [EditingService],
    apiFunctions: {
        getEditingCells,
        getCellEditorInstances,
        startEditingCell,
        stopEditing,
        isEditing,
        cancelEdits,
    },
    dynamicBeans: {
        singleCell: SingleCellEditStrategy,
        fullRow: FullRowEditStrategy,
    },
    dependsOn: [],
    css: [cellEditingCSS],
};

/**
 * @feature Editing -> Undo / Redo Edits
 */
export const UndoRedoEditModule: _ModuleWithApi<_UndoRedoGridApi> = {
    moduleName: 'UndoRedoEdit',
    version: VERSION,
    beans: [UndoRedoService],
    apiFunctions: {
        undoCellEditing,
        redoCellEditing,
        getCurrentUndoSize,
        getCurrentRedoSize,
    },
    dependsOn: [EditingCoreModule],
};

/**
 * @feature Editing -> Text Editor
 */
export const TextEditorModule: _ModuleWithoutApi = {
    moduleName: 'TextEditor',
    version: VERSION,
    userComponents: { agCellEditor: TextCellEditor, agTextCellEditor: TextCellEditor },
    dependsOn: [EditingCoreModule],
};

/**
 * @feature Editing -> Number Editor
 */
export const NumberEditorModule: _ModuleWithoutApi = {
    moduleName: 'NumberEditor',
    version: VERSION,
    userComponents: {
        agNumberCellEditor: {
            classImp: NumberCellEditor,
            params: {
                suppressPreventDefault: true,
            } as DefaultProvidedCellEditorParams,
        },
    },
    dependsOn: [EditingCoreModule],
};

/**
 * @feature Editing -> Date Editor
 */
export const DateEditorModule: _ModuleWithoutApi = {
    moduleName: 'DateEditor',
    version: VERSION,
    userComponents: {
        agDateCellEditor: DateCellEditor,
        agDateStringCellEditor: DateStringCellEditor,
    },
    dependsOn: [EditingCoreModule],
};

/**
 * @feature Editing -> Checkbox Editor
 */
export const CheckboxEditorModule: _ModuleWithoutApi = {
    moduleName: 'CheckboxEditor',
    version: VERSION,
    userComponents: {
        agCheckboxCellEditor: CheckboxCellEditor,
    },
    dependsOn: [EditingCoreModule],
};

/**
 * @feature Editing -> Select Editor
 */
export const SelectEditorModule: _ModuleWithoutApi = {
    moduleName: 'SelectEditor',
    version: VERSION,
    userComponents: { agSelectCellEditor: SelectCellEditor },
    dependsOn: [EditingCoreModule],
};

/**
 * @feature Editing -> Large Text Editor
 */
export const LargeTextEditorModule: _ModuleWithoutApi = {
    moduleName: 'LargeTextEditor',
    version: VERSION,
    userComponents: { agLargeTextCellEditor: LargeTextCellEditor },
    dependsOn: [EditingCoreModule],
};

/**
 * @feature Editing
 */
export const CustomEditorModule: _ModuleWithoutApi = {
    moduleName: 'CustomEditor',
    version: VERSION,
    dependsOn: [EditingCoreModule],
};
