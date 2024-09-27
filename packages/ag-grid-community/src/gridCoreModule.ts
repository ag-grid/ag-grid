import { AlignedGridsModule } from './alignedGrids/alignedGridsModule';
import { CommunityApiModule } from './api/apiModule';
import { ColumnAutosizeModule } from './columnAutosize/columnAutosizeModule';
import { ColumnMoveModule } from './columnMove/columnMoveModule';
import { ColumnResizeModule } from './columnResize/columnResizeModule';
import { ControlsColumnModule, DataTypeModule } from './columns/columnModule';
import { CellRendererFunctionModule } from './components/framework/cellRendererFunctionModule';
import { DragAndDropModule, RowDragModule } from './dragAndDrop/dragModule';
import { EditModule } from './edit/editModule';
import { FilterModule } from './filter/filterModule';
import { ColumnGroupHeaderModule, ColumnHeaderModule } from './headerRendering/cells/headerModule';
import { _defineModule } from './interfaces/iModule';
import { StateModule } from './misc/state/stateModule';
import { ModuleNames } from './modules/moduleNames';
import { PaginationModule } from './pagination/paginationModule';
import { PinnedRowModule } from './pinnedRowModel/pinnedRowModule';
import {
    AnimateShowChangeCellRendererModule,
    AnimateSlideCellRendererModule,
    CheckboxCellRendererModule,
} from './rendering/cellRenderers/cellRendererModule';
import { StickyRowModule } from './rendering/features/stickyRowModule';
import { OverlayModule } from './rendering/overlays/overlayModule';
import { RowSelectionModule } from './selection/rowSelectionModule';
import { SortModule } from './sort/sortModule';
import { ExpressionModule, ValueCacheModule } from './valueService/valueModule';
import { VERSION } from './version';

export const GridCoreModule = {
    version: VERSION,
    moduleName: ModuleNames.CommunityCoreModule,
};

export const CommunityFeaturesModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/core-community-features',
    dependantModules: [
        GridCoreModule,
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
    ],
});
