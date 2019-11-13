#!/usr/bin/env bash
error_found=0 
count=$(grep -c 'var CsvExportModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var EnterpriseCoreModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: EnterpriseCoreModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/ClientSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/ClientSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var EnterpriseCoreModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: EnterpriseCoreModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/CsvExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/CsvExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var EnterpriseCoreModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: EnterpriseCoreModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/InfiniteRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/InfiniteRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/GridChartsModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/GridChartsModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/ClipboardModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/ClipboardModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/ColumnsToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/ColumnsToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/ExcelExportModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/ExcelExportModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/FiltersToolPanelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/FiltersToolPanelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/MasterDetailModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/MasterDetailModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/MenuModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/MenuModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/RangeSelectionModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/RangeSelectionModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/RichSelectModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/RichSelectModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/RowGroupingModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/RowGroupingModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/ServerSideRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/ServerSideRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/SetFilterModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/SetFilterModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/SideBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/SideBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ViewportRowModelModule = {' ../bundles/StatusBarModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ViewportRowModelModule found in ../bundles/StatusBarModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClientSideRowModelModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClientSideRowModelModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var CsvExportModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: CsvExportModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var InfiniteRowModelModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: InfiniteRowModelModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var GridChartsModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: GridChartsModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ClipboardModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ClipboardModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ColumnsToolPanelModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ColumnsToolPanelModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ExcelExportModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ExcelExportModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var FiltersToolPanelModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: FiltersToolPanelModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MasterDetailModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MasterDetailModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var MenuModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: MenuModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RangeSelectionModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RangeSelectionModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RichSelectModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RichSelectModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var RowGroupingModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: RowGroupingModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var ServerSideRowModelModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ServerSideRowModelModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SetFilterModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SetFilterModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var SideBarModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: SideBarModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 
count=$(grep -c 'var StatusBarModule = {' ../bundles/ViewportRowModelModule.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: StatusBarModule found in ../bundles/ViewportRowModelModule.bundle.js"
    error_found=1
fi
 exit $error_found