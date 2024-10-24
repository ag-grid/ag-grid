import type { BeanCollection, BeanName } from './context';
import type { GenericBean } from './genericBean';

/**
 * We know that there is a risk in a change of behaviour if beans are registered in a different order due to the way
 * that this means that their event listeners will be registered in a different order. If they fire in a different order
 * there is a risk that behaviour will be inconsistent.
 * As core beans are going to become optional and could be registered in unpredictable orders via feature modules,
 * we need to provide a consistent order for them to be registered in.
 *
 * We have not included beans from modules as they will be registered after the core beans in the order they are provided.
 */
const orderedCoreBeans: BeanName[] = [
    // core beans only
    'environment',
    'eventSvc',
    'gos',
    'paginationAutoPageSizeService',
    'apiFunctionService',
    'gridApi',
    'registry',
    'agComponentUtils',
    'userCompFactory',
    'rowContainerHeight',
    'horizontalResizeService',
    'localeSvc',
    'validation',
    'pinnedRowModel',
    'dragSvc',
    'columnGroupService',
    'visibleCols',
    'popupSvc',
    'selectionSvc',
    'colFilter',
    'quickFilterService',
    'filterManager',
    'colModel',
    'headerNavigation',
    'pageBoundsService',
    'paginationService',
    'pageBoundsListener',
    'stickyRowService',
    'rowRenderer',
    'expressionService',
    'colFactory',
    'alignedGridsService',
    'navigation',
    'valueCache',
    'valueSvc',
    'loggerFactory',
    'autoWidthCalculator',
    'filterMenuFactory',
    'dragAndDrop',
    'focusSvc',
    'mouseEventService',
    'cellNavigation',
    'cellStyles',
    'scrollVisibleService',
    'sortSvc',
    'colHover',
    'colAnimation',
    'autoColService',
    'selectionColService',
    'changeDetectionService',
    'animationFrameSvc',
    'undoRedoService',
    'columnDefFactory',
    'rowStyleSvc',
    'rowNodeBlockLoader',
    'rowNodeSorter',
    'ctrlsSvc',
    'pinnedColumnService',
    'dataTypeService',
    'syncSvc',
    'overlayService',
    'stateService',
    'expansionService',
    'apiEventService',
    'ariaAnnounce',
    'menuService',
    'colState',
    'colMoves',
    'columnAutosizeService',
    'colFlex',
    'colResize',
    'funcColsService',
    'colNames',
    'colViewport',
    'pivotResultColsService',
    'showRowGroupColsService',
];

const beanNamePosition: { [key in BeanName]?: number } = Object.fromEntries(
    orderedCoreBeans.map((beanName, index) => [beanName, index])
);

export function gridBeanInitComparator(
    bean1: GenericBean<BeanName, BeanCollection>,
    bean2: GenericBean<BeanName, BeanCollection>
): number {
    // if the beans are not in the ordered list, just ensure they are after the ordered beans and stable to provided order
    const index1 = (bean1.beanName ? beanNamePosition[bean1.beanName] : undefined) ?? Number.MAX_SAFE_INTEGER;
    const index2 = (bean2.beanName ? beanNamePosition[bean2.beanName] : undefined) ?? Number.MAX_SAFE_INTEGER;
    return index1 - index2;
}

export function gridBeanDestroyComparator(
    bean1: GenericBean<BeanName, BeanCollection>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bean2: GenericBean<BeanName, BeanCollection>
): number {
    return bean1?.beanName === 'gridDestroyService' ? -1 : 0;
}
