import type { DynamicBeanName } from '../../context/context';
import type { ValidationModuleName } from '../../interfaces/iModule';

export const DYNAMIC_BEAN_MODULES: Record<DynamicBeanName, ValidationModuleName> = {
    detailCellRendererCtrl: 'SharedMasterDetail',
    dndSourceComp: 'DragAndDrop',
    fillHandle: 'CellSelection',
    groupCellRendererCtrl: 'GroupCellRenderer',
    headerFilterCellCtrl: 'ColumnFilter',
    headerGroupCellCtrl: 'ColumnGroup',
    rangeHandle: 'CellSelection',
    tooltipFeature: 'Tooltip',
    groupStrategy: 'RowGrouping',
    treeGroupStrategy: 'TreeData',
    rowNumberRowResizer: 'RowNumbers',
    singleCell: 'EditCore',
    fullRow: 'EditCore',
    agSetColumnFilterHandler: 'SetFilter',
    agMultiColumnFilterHandler: 'MultiFilter',
    agGroupColumnFilterHandler: 'GroupFilter',
    agNumberColumnFilterHandler: 'NumberFilter',
    agDateColumnFilterHandler: 'DateFilter',
    agTextColumnFilterHandler: 'TextFilter',
};
