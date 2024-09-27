import { AlignedGridsModule } from './alignedGrids/alignedGridsModule';
import { ApiFunctionService } from './api/apiFunctionService';
import { CommunityApiModule } from './api/apiModule';
import { CellNavigationService } from './cellNavigationService';
import { ColumnAutosizeModule } from './columnAutosize/columnAutosizeModule';
import { ColumnMoveModule } from './columnMove/columnMoveModule';
import { ColumnResizeModule } from './columnResize/columnResizeModule';
import { ColumnFactory } from './columns/columnFactory';
import { ColumnHoverModule } from './columns/columnHover/columnHoverModule';
import { ColumnModel } from './columns/columnModel';
import { ColumnFlexModule, ControlsColumnModule, DataTypeModule, GetColumnDefsModule } from './columns/columnModule';
import { ColumnNameService } from './columns/columnNameService';
import { ColumnStateService } from './columns/columnStateService';
import { ColumnViewportService } from './columns/columnViewportService';
import { FuncColsService } from './columns/funcColsService';
import { VisibleColsService } from './columns/visibleColsService';
import { CellRendererFunctionModule } from './components/framework/cellRendererFunctionModule';
import { ComponentMetadataProvider } from './components/framework/componentMetadataProvider';
import { UserComponentFactory } from './components/framework/userComponentFactory';
import { UserComponentRegistry } from './components/framework/userComponentRegistry';
import { CtrlsFactory } from './ctrlsFactory';
import { CtrlsService } from './ctrlsService';
import { DragAndDropModule, RowDragModule } from './dragAndDrop/dragModule';
import { EditModule } from './edit/editModule';
import { RowPositionUtils } from './entities/rowPositionUtils';
import { Environment } from './environment';
import { EventService } from './eventService';
import { FilterModule } from './filter/filterModule';
import { FocusService } from './focusService';
import { MouseEventService } from './gridBodyComp/mouseEventService';
import { NavigationService } from './gridBodyComp/navigationService';
import { PinnedWidthService } from './gridBodyComp/pinnedWidthService';
import { ScrollVisibleService } from './gridBodyComp/scrollVisibleService';
import { GridDestroyService } from './gridDestroyService';
import { GridOptionsService } from './gridOptionsService';
import { ColumnGroupHeaderModule, ColumnHeaderModule } from './headerRendering/cells/headerModule';
import { HeaderNavigationService } from './headerRendering/common/headerNavigationService';
import { _defineModule } from './interfaces/iModule';
import { LocaleService } from './localeService';
import { AnimationFrameModule } from './misc/animationFrameModule';
import { EventApiModule } from './misc/apiEvents/apiEventModule';
import { StateModule } from './misc/state/stateModule';
import { ModuleNames } from './modules/moduleNames';
import { PageBoundsListener } from './pagination/pageBoundsListener';
import { PageBoundsService } from './pagination/pageBoundsService';
import { PaginationModule } from './pagination/paginationModule';
import { PinnedRowModule } from './pinnedRowModel/pinnedRowModule';
import { AriaAnnouncementService } from './rendering/ariaAnnouncementService';
import {
    AnimateShowChangeCellRendererModule,
    AnimateSlideCellRendererModule,
    CheckboxCellRendererModule,
} from './rendering/cellRenderers/cellRendererModule';
import { ColumnAnimationModule } from './rendering/columnAnimationModule';
import { StickyRowModule } from './rendering/features/stickyRowModule';
import { OverlayModule } from './rendering/overlays/overlayModule';
import { RowContainerHeightService } from './rendering/rowContainerHeightService';
import { RowRenderer } from './rendering/rowRenderer';
import { RowSelectionModule } from './selection/rowSelectionModule';
import { SortModule } from './sort/sortModule';
import { CellStyleModule, RowStyleModule } from './styling/stylingModule';
import { SyncService } from './syncService';
import { ValidationService } from './validation/validationService';
import { ChangeDetectionModule, ExpressionModule, ValueCacheModule } from './valueService/valueModule';
import { ValueService } from './valueService/valueService';
import { VERSION } from './version';
import { PopupModule } from './widgets/popupModule';

export const GridCoreModule = {
    version: VERSION,
    moduleName: ModuleNames.CommunityCoreModule,
    beans: [
        RowPositionUtils,
        GridDestroyService,
        ApiFunctionService,
        UserComponentRegistry,
        ComponentMetadataProvider,
        UserComponentFactory,
        RowContainerHeightService,
        LocaleService,
        VisibleColsService,
        EventService,
        GridOptionsService,
        ColumnModel,
        HeaderNavigationService,
        PageBoundsService,
        PageBoundsListener,
        RowRenderer,
        ColumnFactory,
        NavigationService,
        ValueService,
        FocusService,
        MouseEventService,
        Environment,
        CellNavigationService,
        ScrollVisibleService,
        CtrlsService,
        PinnedWidthService,
        CtrlsFactory,
        SyncService,
        AriaAnnouncementService,
        ColumnStateService,
        FuncColsService,
        ColumnNameService,
        ColumnViewportService,
    ],
};

export const ValidationsModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/core-validations',
    beans: [ValidationService],
});

export const CommunityFeaturesModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/core-community-features',
    dependantModules: [
        GridCoreModule,
        ValidationsModule,
        EditModule,
        FilterModule,
        StateModule,
        DataTypeModule,
        AlignedGridsModule,
        PaginationModule,
        CommunityApiModule,
        ColumnMoveModule,
        ColumnAutosizeModule,
        ControlsColumnModule,
        ColumnResizeModule,
        DragAndDropModule,
        RowDragModule,
        PinnedRowModule,
        StickyRowModule,
        RowSelectionModule,
        SortModule,
        ValueCacheModule,
        ExpressionModule,
        AnimateShowChangeCellRendererModule,
        AnimateSlideCellRendererModule,
        CheckboxCellRendererModule,
        ColumnHeaderModule,
        ColumnGroupHeaderModule,
        OverlayModule,
        CellRendererFunctionModule,
        PopupModule,
        CellStyleModule,
        ColumnHoverModule,
        ColumnAnimationModule,
        ChangeDetectionModule,
        AnimationFrameModule,
        GetColumnDefsModule,
        RowStyleModule,
        EventApiModule,
        ColumnFlexModule,
    ],
});
