import type { _ModuleWithoutApi } from 'ag-grid-community';

import { baseEnterpriseModule } from '../moduleUtils';
import { LoadingCellRenderer } from './loadingCellRenderer';
import { SkeletonCellRenderer } from './skeletonCellRenderer';

export const LoadingCellRendererModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('LoadingCellRendererModule'),
    userComponents: [
        {
            classImp: LoadingCellRenderer,
            name: 'agLoadingCellRenderer',
        },
    ],
};

export const SkeletonCellRendererModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('SkeletonCellRendererModule'),
    userComponents: [
        {
            classImp: SkeletonCellRenderer,
            name: 'agSkeletonCellRenderer',
        },
    ],
};
