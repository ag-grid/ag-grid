import {ColumnController, SvgFactory, MenuItemDef, Autowired, Utils, Bean, GridOptionsWrapper, GridApi, Column} from 'ag-grid';
import {ClipboardService} from "../clipboardService";
import {AggFuncService} from "../aggregation/aggFuncService";

var svgFactory = SvgFactory.getInstance();

@Bean('menuItemMapper')
export class MenuItemMapper {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('clipboardService') private clipboardService: ClipboardService;
    @Autowired('aggFuncService') private aggFuncService: AggFuncService;

    public mapWithStockItems(originalList: (MenuItemDef|string)[], column: Column): (MenuItemDef|string)[] {
        if (!originalList) { return []; }

        let resultList: (MenuItemDef|string)[] = [];

        originalList.forEach( menuItemOrString => {
            let result: MenuItemDef|string;
            if (typeof menuItemOrString === 'string') {
                result = this.getStockMenuItem(<string>menuItemOrString, column);
            } else {
                result = menuItemOrString;
            }
            if ((<any>result).subMenu) {
                var resultDef = <MenuItemDef> result;
                resultDef.subMenu = this.mapWithStockItems(resultDef.subMenu, column);
            }

            resultList.push(result);
        });

        return resultList;
    }

    private getStockMenuItem(key: string, column: Column): MenuItemDef|string {

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        switch (key) {
            case 'pinSubMenu': return {
                name: localeTextFunc('pinColumn', 'Pin Column'),
                icon: Utils.createIconNoSpan('menuPin', this.gridOptionsWrapper, null, svgFactory.createPinIcon),
                subMenu: ['pinLeft','pinRight','clearPinned']
            };
            case 'pinLeft': return {
                name: localeTextFunc('pinLeft', 'Pin Left'),
                action: ()=> this.columnController.setColumnPinned(column, Column.PINNED_LEFT),
                checked: column.isPinnedLeft()
            };
            case 'pinRight': return {
                name: localeTextFunc('pinRight', 'Pin Right'),
                action: ()=> this.columnController.setColumnPinned(column, Column.PINNED_RIGHT),
                checked: column.isPinnedRight()
            };
            case 'clearPinned': return {
                name: localeTextFunc('noPin', 'No Pin'),
                action: ()=> this.columnController.setColumnPinned(column, null),
                checked: !column.isPinned()
            };
            case 'valueAggSubMenu': return {
                name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                icon: Utils.createIconNoSpan('menuValue', this.gridOptionsWrapper, null, svgFactory.createAggregationIcon),
                subMenu: this.createAggregationSubMenu(column)
            };
            case 'autoSizeThis': return {
                name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                action: ()=> this.columnController.autoSizeColumn(column)
            };
            case 'autoSizeAll': return {
                name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                action: ()=> this.columnController.autoSizeAllColumns()
            };
            case 'rowGroup': return {
                name: localeTextFunc('groupBy', 'Group by') + ' ' + column.getColDef().headerName,
                action: ()=> this.columnController.addRowGroupColumn(column),
                icon: Utils.createIconNoSpan('menuAddRowGroup', this.gridOptionsWrapper, null, svgFactory.createGroupIcon12)
            };
            case 'rowUnGroup': return {
                name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + column.getColDef().headerName,
                action: ()=> this.columnController.removeRowGroupColumn(column),
                icon: Utils.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsWrapper, null, svgFactory.createGroupIcon12)
            };
            case 'resetColumns': return {
                name: localeTextFunc('resetColumns', 'Reset Columns'),
                action: ()=> this.columnController.resetColumnState()
            };
            case 'expandAll': return {
                name: localeTextFunc('expandAll', 'Expand All'),
                action: ()=> this.gridApi.expandAll()
            };
            case 'contractAll': return {
                name: localeTextFunc('collapseAll', 'Collapse All'),
                action: ()=> this.gridApi.collapseAll()
            };
            case 'copy': return {
                name: localeTextFunc('copy','Copy'),
                shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                icon: Utils.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null, svgFactory.createCopyIcon),
                action: ()=> this.clipboardService.copyToClipboard(false)
            };
            case 'copyWithHeaders': return {
                name: localeTextFunc('copyWithHeaders','Copy with Headers'),
                // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                icon: Utils.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null, svgFactory.createCopyIcon),
                action: ()=> this.clipboardService.copyToClipboard(true)
            };
            case 'paste': return {
                name: localeTextFunc('paste','Paste'),
                shortcut: localeTextFunc('ctrlV','Ctrl+V'),
                disabled: true,
                icon: Utils.createIconNoSpan('clipboardPaste', this.gridOptionsWrapper, null, svgFactory.createPasteIcon),
                action: ()=> this.clipboardService.pasteFromClipboard()
            };
            case 'toolPanel': return {
                name: localeTextFunc('toolPanel', 'Tool Panel'),
                checked: this.gridApi.isToolPanelShowing(),
                action: ()=> this.gridApi.showToolPanel(!this.gridApi.isToolPanelShowing())
            };
            case 'export': return {
                name: localeTextFunc('export', 'Export'),
                subMenu: ['csvExport','excelExport']
            };
            case 'csvExport': return {
                name: localeTextFunc('csvExport', 'CSV Export'),
                action: ()=> this.gridApi.exportDataAsCsv({})
            };
            case 'excelExport': return {
                name: localeTextFunc('excelExport', 'Excel Export'),
                action: ()=> this.gridApi.exportDataAsExcel({})
            };
            case 'separator': return 'separator';
            default:
                console.log(`ag-Grid: unknown menu item type ${key}`);
                return null;
        }
    }

    private createAggregationSubMenu(column: Column): MenuItemDef[] {

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnIsAlreadyAggValue = column.isValueActive();
        var funcNames = this.aggFuncService.getFuncNames();

        var columnToUse: Column;
        if (column.isPrimary()) {
            columnToUse = column;
        } else {
            columnToUse = column.getColDef().pivotValueColumn;
        }

        var result: MenuItemDef[] = [];

        funcNames.forEach( (funcName)=> {
            result.push({
                name: localeTextFunc(funcName, funcName),
                action: ()=> {
                    this.columnController.setColumnAggFunc(columnToUse, funcName);
                    this.columnController.addValueColumn(columnToUse);
                },
                checked: columnIsAlreadyAggValue && columnToUse.getAggFunc() === funcName
            });
        });

        return result;
    }
}
