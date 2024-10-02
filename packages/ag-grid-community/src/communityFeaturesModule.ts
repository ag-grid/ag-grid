import { AlignedGridsModule } from './alignedGrids/alignedGridsModule';
import { RowApiModule, ScrollApiModule } from './api/apiModule';
import { ColumnAutosizeModule } from './columnAutosize/columnAutosizeModule';
import { ColumnMoveModule } from './columnMove/columnMoveModule';
import { ColumnResizeModule } from './columnResize/columnResizeModule';
import { ColumnHoverModule } from './columns/columnHover/columnHoverModule';
import {
    ColumnApiModule,
    ColumnFlexModule,
    ControlsColumnModule,
    DataTypeModule,
    GetColumnDefsApiModule,
} from './columns/columnModule';
import { CellRendererFunctionModule } from './components/framework/cellRendererFunctionModule';
import { DragAndDropModule, RowDragModule } from './dragAndDrop/dragModule';
import { EditModule } from './edit/editModule';
import { FilterModule } from './filter/filterModule';
import { ColumnGroupHeaderModule, ColumnHeaderModule } from './headerRendering/cells/headerModule';
import { defineCommunityModule } from './interfaces/iModule';
import { AnimationFrameModule } from './misc/animationFrameModule';
import { EventApiModule } from './misc/apiEvents/apiEventModule';
import { CommunityMenuApiModule } from './misc/menu/sharedMenuModule';
import { StateModule } from './misc/state/stateModule';
import { KeyboardNavigationModule } from './navigation/navigationModule';
import { PaginationModule } from './pagination/paginationModule';
import { PinnedRowModule } from './pinnedRowModel/pinnedRowModule';
import {
    AnimateShowChangeCellRendererModule,
    AnimateSlideCellRendererModule,
    CheckboxCellRendererModule,
} from './rendering/cellRenderers/cellRendererModule';
import { ColumnAnimationModule } from './rendering/columnAnimationModule';
import { StickyRowModule } from './rendering/features/stickyRowModule';
import { OverlayModule } from './rendering/overlays/overlayModule';
import { RenderApiModule } from './rendering/renderModule';
import { RowSelectionModule } from './selection/rowSelectionModule';
import { SortModule } from './sort/sortModule';
import { CellStyleModule, RowStyleModule } from './styling/stylingModule';
import { ValidationModule } from './validation/validationModule';
import { CellApiModule, ChangeDetectionModule, ExpressionModule, ValueCacheModule } from './valueService/valueModule';
import { PopupModule } from './widgets/popupModule';

export const CommunityFeaturesModule = defineCommunityModule('CommunityFeaturesModule', {
    dependsOn: [
        ValidationModule,
        EditModule,
        FilterModule,
        StateModule,
        DataTypeModule,
        AlignedGridsModule,
        PaginationModule,
        ColumnApiModule,
        RowApiModule,
        ScrollApiModule,
        RenderApiModule,
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
        GetColumnDefsApiModule,
        RowStyleModule,
        EventApiModule,
        ColumnFlexModule,
        KeyboardNavigationModule,
        CellApiModule,
        CommunityMenuApiModule,
    ],
});
