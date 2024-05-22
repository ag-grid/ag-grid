import type { ColumnModel } from '../columns/columnModel';
import type { ColumnMoveService } from '../columns/columnMoveService';
import type { ColumnNameService } from '../columns/columnNameService';
import type { ColumnSizeService } from '../columns/columnSizeService';
import type { ColumnViewportService } from '../columns/columnViewportService';
import type { VisibleColsService } from '../columns/visibleColsService';
import type { AgStackComponentsRegistry } from '../components/agStackComponentsRegistry';
import type { UserComponentFactory } from '../components/framework/userComponentFactory';
import type { UserComponentRegistry } from '../components/framework/userComponentRegistry';
import type { Context} from '../context/context';
import { Autowired, Bean, Optional, PostConstruct } from '../context/context';
import type { CtrlsFactory } from '../ctrlsFactory';
import type { CtrlsService } from '../ctrlsService';
import type { DragAndDropService } from '../dragAndDrop/dragAndDropService';
import type { DragService } from '../dragAndDrop/dragService';
import type { CellPositionUtils } from '../entities/cellPositionUtils';
import type { RowNodeEventThrottle } from '../entities/rowNodeEventThrottle';
import type { RowPositionUtils } from '../entities/rowPositionUtils';
import type { Environment } from '../environment';
import type { EventService } from '../eventService';
import type { FilterManager } from '../filter/filterManager';
import type { FocusService } from '../focusService';
import type { NavigationService } from '../gridBodyComp/navigationService';
import type { GridOptionsService } from '../gridOptionsService';
import type { HeaderNavigationService } from '../headerRendering/common/headerNavigationService';
import type { IRangeService, ISelectionHandleFactory } from '../interfaces/IRangeService';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
import type { IRowModel } from '../interfaces/iRowModel';
import type { ISelectionService } from '../interfaces/iSelectionService';
import type { IServerSideRowModel } from '../interfaces/iServerSideRowModel';
import type { LocaleService } from '../localeService';
import type { AnimationFrameService } from '../misc/animationFrameService';
import type { ResizeObserverService } from '../misc/resizeObserverService';
import type { PaginationProxy } from '../pagination/paginationProxy';
import type { SortController } from '../sortController';
import type { StylingService } from '../styling/stylingService';
import type { SyncService } from '../syncService';
import type { ValueCache } from '../valueService/valueCache';
import type { ValueService } from '../valueService/valueService';
import type { PopupService } from '../widgets/popupService';
import type { AriaAnnouncementService } from './ariaAnnouncementService';
import type { ColumnAnimationService } from './columnAnimationService';
import type { ColumnHoverService } from './columnHoverService';
import type { RowCssClassCalculator } from './row/rowCssClassCalculator';
import type { RowContainerHeightService } from './rowContainerHeightService';
import type { RowRenderer } from './rowRenderer';

/** Using the IoC has a slight performance consideration, which is no problem most of the
 * time, unless we are trashing objects - which is the case when scrolling and rowComp
 * and cellComp. So for performance reasons, RowComp and CellComp do not get autowired
 * with the IoC. Instead they get passed this object which is all the beans the RowComp
 * and CellComp need. Not autowiring all the cells gives performance improvement. */
@Bean('beans')
export class Beans {
    @Autowired('resizeObserverService') public readonly resizeObserverService: ResizeObserverService;
    @Autowired('paginationProxy') public readonly paginationProxy: PaginationProxy;
    @Autowired('context') public readonly context: Context;
    @Autowired('gridOptionsService') public readonly gos: GridOptionsService;
    @Autowired('environment') public readonly environment: Environment;
    @Autowired('rowRenderer') public readonly rowRenderer: RowRenderer;
    @Autowired('valueService') public readonly valueService: ValueService;
    @Autowired('eventService') public readonly eventService: EventService;
    @Autowired('columnModel') public readonly columnModel: ColumnModel;
    @Autowired('columnViewportService') public readonly columnViewportService: ColumnViewportService;
    @Autowired('columnNameService') public readonly columnNameService: ColumnNameService;
    @Autowired('visibleColsService') public readonly visibleColsService: VisibleColsService;
    @Autowired('columnMoveService') public readonly columnMoveService: ColumnMoveService;
    @Autowired('columnSizeService') public readonly columnSizeService: ColumnSizeService;
    @Autowired('headerNavigationService') public readonly headerNavigationService: HeaderNavigationService;
    @Autowired('navigationService') public readonly navigationService: NavigationService;
    @Autowired('columnAnimationService') public readonly columnAnimationService: ColumnAnimationService;
    @Autowired('focusService') public readonly focusService: FocusService;
    @Autowired('popupService') public readonly popupService: PopupService;
    @Autowired('stylingService') public readonly stylingService: StylingService;
    @Autowired('columnHoverService') public readonly columnHoverService: ColumnHoverService;
    @Autowired('userComponentFactory') public readonly userComponentFactory: UserComponentFactory;
    @Autowired('userComponentRegistry') public readonly userComponentRegistry: UserComponentRegistry;
    @Autowired('animationFrameService') public readonly animationFrameService: AnimationFrameService;
    @Autowired('dragService') public readonly dragService: DragService;
    @Autowired('dragAndDropService') public readonly dragAndDropService: DragAndDropService;
    @Autowired('sortController') public readonly sortController: SortController;
    @Autowired('filterManager') public readonly filterManager: FilterManager;
    @Autowired('rowContainerHeightService') public readonly rowContainerHeightService: RowContainerHeightService;
    @Autowired('frameworkOverrides') public readonly frameworkOverrides: IFrameworkOverrides;
    @Autowired('cellPositionUtils') public readonly cellPositionUtils: CellPositionUtils;
    @Autowired('rowPositionUtils') public readonly rowPositionUtils: RowPositionUtils;
    @Autowired('selectionService') public readonly selectionService: ISelectionService;
    @Autowired('rowCssClassCalculator') public readonly rowCssClassCalculator: RowCssClassCalculator;
    @Autowired('rowModel') public readonly rowModel: IRowModel;
    @Autowired('ctrlsService') public readonly ctrlsService: CtrlsService;
    @Autowired('ctrlsFactory') public readonly ctrlsFactory: CtrlsFactory;
    @Autowired('agStackComponentsRegistry') public readonly agStackComponentsRegistry: AgStackComponentsRegistry;
    @Autowired('valueCache') public readonly valueCache: ValueCache;
    @Autowired('rowNodeEventThrottle') public readonly rowNodeEventThrottle: RowNodeEventThrottle;
    @Autowired('localeService') public readonly localeService: LocaleService;
    @Autowired('syncService') public readonly syncService: SyncService;
    @Autowired('ariaAnnouncementService') public readonly ariaAnnouncementService: AriaAnnouncementService;

    @Optional('rangeService') public readonly rangeService?: IRangeService;
    @Optional('selectionHandleFactory') public readonly selectionHandleFactory?: ISelectionHandleFactory;

    public clientSideRowModel: IClientSideRowModel;
    public serverSideRowModel: IServerSideRowModel;

    @PostConstruct
    private postConstruct(): void {
        if (this.gos.isRowModelType('clientSide')) {
            this.clientSideRowModel = this.rowModel as IClientSideRowModel;
        }
        if (this.gos.isRowModelType('serverSide')) {
            this.serverSideRowModel = this.rowModel as IServerSideRowModel;
        }
    }
}
