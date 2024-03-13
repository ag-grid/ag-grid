import { ColDef, ColGroupDef, ColumnMenuTab } from '../../entities/colDef';
import { ModuleNames } from '../../modules/moduleNames';
import { Deprecations, OptionsValidator, Validations } from "../validationTypes";
import { ColDefUtil } from '../../components/colDefUtil';
import { GridOptions } from '../../entities/gridOptions';

const COLUMN_DEFINITION_DEPRECATIONS: Deprecations<ColDef | ColGroupDef> = {
    columnsMenuParams: { version: '31.1', message: 'Use `columnChooserParams` instead.' },
    suppressMenu: { version: '31.1', message: 'Use `suppressHeaderMenuButton` instead.' },
    suppressCellFlash: { version: '31.2', message: 'Use `enableCellChangeFlash={false}` in the ColDef' },
    dndSource: { version: '31.2', message: 'This feature has been replaced by `Row Dragging to an External DropZone`.' },
    dndSourceOnRowDrag: { version: '31.2', message: 'This feature has been replaced by `Row Dragging to an External DropZone`.' },
};

const CSRM_REQUIRES_ROW_GROUP_MODULE = (_options: never, gridOptions: GridOptions) => {
    if ((gridOptions.rowModelType ?? 'clientSide') === 'clientSide') {
        return { module: ModuleNames.RowGroupingModule };
    }
    return null;
};

const COLUMN_DEFINITION_VALIDATIONS: Validations<ColDef | ColGroupDef> = {
    // supported on all row models, but need module for client side.
    enableRowGroup: CSRM_REQUIRES_ROW_GROUP_MODULE,
    rowGroup: CSRM_REQUIRES_ROW_GROUP_MODULE,
    rowGroupIndex: CSRM_REQUIRES_ROW_GROUP_MODULE,
    enablePivot: CSRM_REQUIRES_ROW_GROUP_MODULE,
    enableValue: CSRM_REQUIRES_ROW_GROUP_MODULE,
    pivot: CSRM_REQUIRES_ROW_GROUP_MODULE,
    pivotIndex: CSRM_REQUIRES_ROW_GROUP_MODULE,
    aggFunc: CSRM_REQUIRES_ROW_GROUP_MODULE,

    cellEditor: (options) => {
        if (options.cellEditor === 'agRichSelect' || options.cellEditor === 'agRichSelectCellEditor') {
            return { module: ModuleNames.RichSelectModule };
        }
        return null;
    },

    menuTabs: (options) => {
        const enterpriseMenuTabs: ColumnMenuTab[] = ['columnsMenuTab', 'generalMenuTab'];
        if (options.menuTabs?.some(tab => enterpriseMenuTabs.includes(tab))) {
            return {
                module: ModuleNames.MenuModule,
            };
        }
        return null;
    },
    columnsMenuParams: {
        module: [ModuleNames.MenuModule, ModuleNames.ColumnsToolPanelModule],
    },
    columnChooserParams: {
        module: [ModuleNames.MenuModule, ModuleNames.ColumnsToolPanelModule],
    },
    
    headerCheckboxSelection: {
        supportedRowModels: ['clientSide', 'serverSide'],
        dependencies: (_options, { rowSelection }) => (
            rowSelection === 'multiple' ? null : 'headerCheckboxSelection is only supported with rowSelection=multiple'
        )
    },
    headerCheckboxSelectionFilteredOnly: {
        supportedRowModels: ['clientSide'],
        dependencies: (_options, { rowSelection }) => (
            rowSelection === 'multiple' ? null : 'headerCheckboxSelectionFilteredOnly is only supported with rowSelection=multiple'
        ),
    },
    headerCheckboxSelectionCurrentPageOnly: {
        supportedRowModels: ['clientSide'],
        dependencies: (_options, { rowSelection }) => (
            rowSelection === 'multiple' ? null : 'headerCheckboxSelectionCurrentPageOnly is only supported with rowSelection=multiple'
        ),
    },

    children: () => COL_DEF_VALIDATORS,
};

export const COL_DEF_VALIDATORS: OptionsValidator<ColDef | ColGroupDef> = {
    objectName: 'colDef',
    allProperties: ColDefUtil.ALL_PROPERTIES,
    docsUrl: 'column-properties/',
    deprecations: COLUMN_DEFINITION_DEPRECATIONS,
    validations: COLUMN_DEFINITION_VALIDATIONS,
};
