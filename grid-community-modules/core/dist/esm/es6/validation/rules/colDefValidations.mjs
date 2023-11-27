import { ModuleNames } from '../../modules/moduleNames.mjs';
import { ColDefUtil } from '../../components/colDefUtil.mjs';
const COLUMN_DEFINITION_DEPRECATIONS = {};
const CSRM_REQUIRES_ROW_GROUP_MODULE = (_options, gridOptions) => {
    var _a;
    if ((_a = gridOptions.rowModelType) !== null && _a !== void 0 ? _a : 'clientSide' === 'clientSide') {
        return { module: ModuleNames.RowGroupingModule };
    }
    return null;
};
const COLUMN_DEFINITION_VALIDATIONS = {
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
        var _a;
        const enterpriseMenuTabs = ['columnsMenuTab', 'generalMenuTab'];
        if ((_a = options.menuTabs) === null || _a === void 0 ? void 0 : _a.some(tab => enterpriseMenuTabs.includes(tab))) {
            return {
                module: ModuleNames.MenuModule,
            };
        }
        return null;
    },
    columnsMenuParams: {
        module: [ModuleNames.MenuModule, ModuleNames.ColumnsToolPanelModule],
    },
    headerCheckboxSelection: {
        supportedRowModels: ['clientSide', 'serverSide'],
        dependencies: (_options, { rowSelection }) => (rowSelection === 'multiple' ? null : 'headerCheckboxSelection is only supported with rowSelection=multiple')
    },
    headerCheckboxSelectionFilteredOnly: {
        supportedRowModels: ['clientSide'],
        dependencies: (_options, { rowSelection }) => (rowSelection === 'multiple' ? null : 'headerCheckboxSelectionFilteredOnly is only supported with rowSelection=multiple'),
    },
    headerCheckboxSelectionCurrentPageOnly: {
        supportedRowModels: ['clientSide'],
        dependencies: (_options, { rowSelection }) => (rowSelection === 'multiple' ? null : 'headerCheckboxSelectionCurrentPageOnly is only supported with rowSelection=multiple'),
    },
    children: () => COL_DEF_VALIDATORS,
};
export const COL_DEF_VALIDATORS = {
    objectName: 'colDef',
    allProperties: ColDefUtil.ALL_PROPERTIES,
    docsUrl: 'column-properties/',
    deprecations: COLUMN_DEFINITION_DEPRECATIONS,
    validations: COLUMN_DEFINITION_VALIDATIONS,
};
