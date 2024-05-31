import type { Module } from '../interfaces/iModule';
import { VERSION } from '../version';
import { CheckboxCellEditor } from './cellEditors/checkboxCellEditor';
import { DateCellEditor } from './cellEditors/dateCellEditor';
import { DateStringCellEditor } from './cellEditors/dateStringCellEditor';
import { LargeTextCellEditor } from './cellEditors/largeTextCellEditor';
import { NumberCellEditor } from './cellEditors/numberCellEditor';
import { SelectCellEditor } from './cellEditors/selectCellEditor';
import { TextCellEditor } from './cellEditors/textCellEditor';
import { EditService } from './editService';
import { RowEditService } from './rowEditService';

export const EditCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/edit-core',
    beans: [EditService],
};

export const FullRowEditModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/full-row-edit',
    beans: [RowEditService],
    dependantModules: [EditCoreModule],
};

export const DefaultEditorModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/default-editor',
    userComponents: [{ componentName: 'agCellEditor', componentClass: TextCellEditor }],
    dependantModules: [EditCoreModule],
};

export const DataTypeEditorsModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/data-type-editors',
    userComponents: [
        { componentName: 'agTextCellEditor', componentClass: TextCellEditor },
        { componentName: 'agNumberCellEditor', componentClass: NumberCellEditor },
        { componentName: 'agDateCellEditor', componentClass: DateCellEditor },
        { componentName: 'agDateStringCellEditor', componentClass: DateStringCellEditor },
        { componentName: 'agCheckboxCellEditor', componentClass: CheckboxCellEditor },
    ],
    dependantModules: [DefaultEditorModule],
};

export const SelectEditorModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/select-editor',
    userComponents: [{ componentName: 'agSelectCellEditor', componentClass: SelectCellEditor }],
    dependantModules: [EditCoreModule],
};

export const LargeTextEditorModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/large-text-editor',
    userComponents: [{ componentName: 'agLargeTextCellEditor', componentClass: LargeTextCellEditor }],
    dependantModules: [EditCoreModule],
};

const AllCommunityEditorsModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/all-editors',
    dependantModules: [DefaultEditorModule, DataTypeEditorsModule, SelectEditorModule, LargeTextEditorModule],
};

export const EditModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/editing',
    dependantModules: [EditCoreModule, FullRowEditModule, AllCommunityEditorsModule],
};
