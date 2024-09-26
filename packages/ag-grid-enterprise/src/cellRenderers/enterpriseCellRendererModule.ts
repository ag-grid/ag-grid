import { _defineModule } from 'ag-grid-community';

import { VERSION } from '../version';
import { LoadingCellRenderer } from './loadingCellRenderer';
import { SkeletonCellRenderer } from './skeletonCellRenderer';

export const LoadingCellRendererModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/loading-cell-renderer',
    userComponents: [
        {
            classImp: LoadingCellRenderer,
            name: 'agLoadingCellRenderer',
        },
    ],
});

export const SkeletonCellRendererModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/skeleton-cell-renderer',
    userComponents: [
        {
            classImp: SkeletonCellRenderer,
            name: 'agSkeletonCellRenderer',
        },
    ],
});
