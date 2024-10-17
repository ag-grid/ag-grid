import { ApiFunctionService } from './api/apiFunctionService';
import { CoreApiModule } from './api/apiModule';
import { ColumnFactory } from './columns/columnFactory';
import { ColumnModel } from './columns/columnModel';
import { ColumnNameService } from './columns/columnNameService';
import { ColumnStateService } from './columns/columnStateService';
import { ColumnViewportService } from './columns/columnViewportService';
import { VisibleColsService } from './columns/visibleColsService';
import { Registry } from './components/framework/registry';
import { UserComponentFactory } from './components/framework/userComponentFactory';
import { CtrlsService } from './ctrlsService';
import { PositionUtils } from './entities/positionUtils';
import { Environment } from './environment';
import { EventService } from './eventService';
import { FocusService } from './focusService';
import { MouseEventService } from './gridBodyComp/mouseEventService';
import { PinnedWidthService } from './gridBodyComp/pinnedWidthService';
import { ScrollVisibleService } from './gridBodyComp/scrollVisibleService';
import { GridDestroyService } from './gridDestroyService';
import { GridOptionsService } from './gridOptionsService';
import type { _ModuleWithoutApi } from './interfaces/iModule';
import { baseCommunityModule } from './interfaces/iModule';
import { LocaleService } from './localeService';
import { PageBoundsListener } from './pagination/pageBoundsListener';
import { PageBoundsService } from './pagination/pageBoundsService';
import { AriaAnnouncementService } from './rendering/ariaAnnouncementService';
import { RowContainerHeightService } from './rendering/rowContainerHeightService';
import { RowRenderer } from './rendering/rowRenderer';
import { SyncService } from './syncService';
import { ValueService } from './valueService/valueService';

export const CommunityCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('CommunityCoreModule'),
    beans: [
        PositionUtils,
        GridDestroyService,
        ApiFunctionService,
        Registry,
        UserComponentFactory,
        RowContainerHeightService,
        LocaleService,
        VisibleColsService,
        EventService,
        GridOptionsService,
        ColumnModel,
        PageBoundsService,
        PageBoundsListener,
        RowRenderer,
        ColumnFactory,
        ValueService,
        FocusService,
        MouseEventService,
        Environment,
        ScrollVisibleService,
        CtrlsService,
        PinnedWidthService,
        SyncService,
        AriaAnnouncementService,
        ColumnStateService,
        ColumnNameService,
        ColumnViewportService,
    ],
    dependsOn: [CoreApiModule],
};
