import { defineEnterpriseModule } from '../moduleUtils';
import { LoadingCellRenderer } from './loadingCellRenderer';
import { SkeletonCellRenderer } from './skeletonCellRenderer';

export const LoadingCellRendererModule = defineEnterpriseModule('LoadingCellRendererModule', {
    userComponents: [
        {
            classImp: LoadingCellRenderer,
            name: 'agLoadingCellRenderer',
        },
    ],
});

export const SkeletonCellRendererModule = defineEnterpriseModule('SkeletonCellRendererModule', {
    userComponents: [
        {
            classImp: SkeletonCellRenderer,
            name: 'agSkeletonCellRenderer',
        },
    ],
});
