import { ModuleNames } from '../../modules/moduleNames';
import { ColDefUtil } from '../../components/colDefUtil';
var COLUMN_DEFINITION_DEPRECATIONS = {};
var CSRM_REQUIRES_ROW_GROUP_MODULE = function (_options, gridOptions) {
    var _a;
    if ((_a = gridOptions.rowModelType) !== null && _a !== void 0 ? _a : 'clientSide' === 'clientSide') {
        return { module: ModuleNames.RowGroupingModule };
    }
    return null;
};
var COLUMN_DEFINITION_VALIDATIONS = {
    // supported on all row models, but need module for client side.
    enableRowGroup: CSRM_REQUIRES_ROW_GROUP_MODULE,
    rowGroup: CSRM_REQUIRES_ROW_GROUP_MODULE,
    rowGroupIndex: CSRM_REQUIRES_ROW_GROUP_MODULE,
    enablePivot: CSRM_REQUIRES_ROW_GROUP_MODULE,
    enableValue: CSRM_REQUIRES_ROW_GROUP_MODULE,
    pivot: CSRM_REQUIRES_ROW_GROUP_MODULE,
    pivotIndex: CSRM_REQUIRES_ROW_GROUP_MODULE,
    aggFunc: CSRM_REQUIRES_ROW_GROUP_MODULE,
    cellEditor: function (options) {
        if (options.cellEditor === 'agRichSelect' || options.cellEditor === 'agRichSelectCellEditor') {
            return { module: ModuleNames.RichSelectModule };
        }
        return null;
    },
    menuTabs: function (options) {
        var _a;
        var enterpriseMenuTabs = ['columnsMenuTab', 'generalMenuTab'];
        if ((_a = options.menuTabs) === null || _a === void 0 ? void 0 : _a.some(function (tab) { return enterpriseMenuTabs.includes(tab); })) {
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
        dependencies: function (_options, _a) {
            var rowSelection = _a.rowSelection;
            return (rowSelection === 'multiple' ? null : 'headerCheckboxSelection is only supported with rowSelection=multiple');
        }
    },
    headerCheckboxSelectionFilteredOnly: {
        supportedRowModels: ['clientSide'],
        dependencies: function (_options, _a) {
            var rowSelection = _a.rowSelection;
            return (rowSelection === 'multiple' ? null : 'headerCheckboxSelectionFilteredOnly is only supported with rowSelection=multiple');
        },
    },
    headerCheckboxSelectionCurrentPageOnly: {
        supportedRowModels: ['clientSide'],
        dependencies: function (_options, _a) {
            var rowSelection = _a.rowSelection;
            return (rowSelection === 'multiple' ? null : 'headerCheckboxSelectionCurrentPageOnly is only supported with rowSelection=multiple');
        },
    },
    children: function () { return COL_DEF_VALIDATORS; },
};
export var COL_DEF_VALIDATORS = {
    objectName: 'colDef',
    allProperties: ColDefUtil.ALL_PROPERTIES,
    docsUrl: 'column-properties/',
    deprecations: COLUMN_DEFINITION_DEPRECATIONS,
    validations: COLUMN_DEFINITION_VALIDATIONS,
};
