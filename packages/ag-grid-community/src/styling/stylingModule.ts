import { defineCommunityModule } from '../interfaces/iModule';
import { CellStyleService } from './cellStyleService';
import { RowStyleService } from './rowStyleService';

export const CellStyleModule = defineCommunityModule('@ag-grid-community/cell-style', {
    beans: [CellStyleService],
});

export const RowStyleModule = defineCommunityModule('@ag-grid-community/row-style', {
    beans: [RowStyleService],
});
