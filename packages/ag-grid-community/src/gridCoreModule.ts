import { ApiFunctionService } from './api/apiFunctionService';
import {
    destroy,
    getGridElement,
    getGridId,
    getGridOption,
    isDestroyed,
    isModuleRegistered,
    setGridOption,
    updateGridOptions,
} from './api/coreApi';
import type { _CoreGridApi } from './api/gridApi';
import { ClientSideRowModelModule } from './clientSideRowModel/clientSideRowModelModule';
import { ColumnMoveModule } from './columnMove/columnMoveModule';
import { ColumnResizeModule } from './columnResize/columnResizeModule';
import { ColumnGroupModule } from './columns/columnGroups/columnGroupModule';
import { ColumnModel } from './columns/columnModel';
import { ColumnFlexModule, DataTypeModule } from './columns/columnModule';
import { ColumnNameService } from './columns/columnNameService';
import { ColumnViewportService } from './columns/columnViewportService';
import { VisibleColsService } from './columns/visibleColsService';
import { CellRendererFunctionModule } from './components/framework/cellRendererFunctionModule';
import { Registry } from './components/framework/registry';
import { UserComponentFactory } from './components/framework/userComponentFactory';
import { CtrlsService } from './ctrlsService';
import { Environment } from './environment';
import { EventService } from './eventService';
import { FocusService } from './focusService';
import { ScrollVisibleService } from './gridBodyComp/scrollVisibleService';
import { GridDestroyService } from './gridDestroyService';
import { GridOptionsService } from './gridOptionsService';
import { ColumnGroupHeaderCompModule, ColumnHeaderCompModule } from './headerRendering/cells/headerModule';
import type { _ModuleWithApi } from './interfaces/iModule';
import { AnimationFrameModule } from './misc/animationFrameModule';
import { IconService } from './misc/iconService';
import { TouchModule } from './misc/touchModule';
import { KeyboardNavigationModule } from './navigation/navigationModule';
import { PageBoundsListener } from './pagination/pageBoundsListener';
import { PageBoundsService } from './pagination/pageBoundsService';
import { PinnedColumnModule } from './pinnedColumns/pinnedColumnModule';
import { AriaModule } from './rendering/ariaModule';
import { SkeletonCellRendererModule } from './rendering/cellRenderers/cellRendererModule';
import { ColumnDelayRenderModule } from './rendering/columnDelayRenderService';
import { OverlayModule } from './rendering/overlays/overlayModule';
import { RowContainerHeightService } from './rendering/rowContainerHeightService';
import { RowRenderer } from './rendering/rowRenderer';
import { SortModule } from './sort/sortModule';
import { SyncService } from './syncService';
import { LogService } from './validation/logService';
import { ChangeDetectionModule, ExpressionModule } from './valueService/valueModule';
import { ValueService } from './valueService/valueService';
import { VERSION } from './version';

/**
 * @internal
 */
export const CommunityCoreModule: _ModuleWithApi<_CoreGridApi> = {
    moduleName: 'CommunityCore',
    version: VERSION,
    beans: [
        LogService,
        GridDestroyService,
        ApiFunctionService,
        Registry,
        UserComponentFactory,
        RowContainerHeightService,
        VisibleColsService,
        EventService,
        GridOptionsService,
        ColumnModel,
        PageBoundsService,
        PageBoundsListener,
        RowRenderer,
        ValueService,
        FocusService,
        Environment,
        ScrollVisibleService,
        CtrlsService,
        SyncService,
        ColumnNameService,
        ColumnViewportService,
        IconService,
    ],
    apiFunctions: {
        getGridId,
        getGridElement,
        destroy,
        isDestroyed,
        getGridOption,
        setGridOption,
        updateGridOptions,
        isModuleRegistered,
    },
    dependsOn: [
        ClientSideRowModelModule,
        DataTypeModule,
        ColumnMoveModule,
        ColumnResizeModule,
        SortModule,
        ColumnHeaderCompModule,
        ColumnGroupModule,
        ColumnGroupHeaderCompModule,
        OverlayModule,
        ChangeDetectionModule,
        AnimationFrameModule,
        KeyboardNavigationModule,
        PinnedColumnModule,
        AriaModule,
        TouchModule,
        CellRendererFunctionModule,
        ColumnFlexModule,
        ExpressionModule,
        SkeletonCellRendererModule,
        ColumnDelayRenderModule,
    ],
};
