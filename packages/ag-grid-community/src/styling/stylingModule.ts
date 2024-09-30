import { defineCommunityModule } from '../interfaces/iModule';
import { CellStyleService } from './cellStyleService';
import { RowStyleService } from './rowStyleService';

export const CellStyleModule = defineCommunityModule('CellStyleModule', {
    beans: [CellStyleService],
});

export const RowStyleModule = defineCommunityModule('RowStyleModule', {
    beans: [RowStyleService],
});
