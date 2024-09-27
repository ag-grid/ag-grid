import { defineEnterpriseModule } from '../moduleUtils';
import { LoadingCellRenderer } from './loadingCellRenderer';
import { SkeletonCellRenderer } from './skeletonCellRenderer';

export const LoadingCellRendererModule = defineEnterpriseModule('@ag-grid-enterprise/loading-cell-renderer', {
    userComponents: [
        {
            classImp: LoadingCellRenderer,
            name: 'agLoadingCellRenderer',
        },
    ],
});

export const SkeletonCellRendererModule = defineEnterpriseModule('@ag-grid-enterprise/skeleton-cell-renderer', {
    userComponents: [
        {
            classImp: SkeletonCellRenderer,
            name: 'agSkeletonCellRenderer',
        },
    ],
});
