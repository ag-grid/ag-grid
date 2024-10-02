import type { Module } from 'ag-grid-community';

import { baseEnterpriseModule } from '../moduleUtils';
import { LoadingCellRenderer } from './loadingCellRenderer';
import { SkeletonCellRenderer } from './skeletonCellRenderer';

export const LoadingCellRendererModule: Module = {
    ...baseEnterpriseModule('LoadingCellRendererModule'),
    userComponents: [
        {
            classImp: LoadingCellRenderer,
            name: 'agLoadingCellRenderer',
        },
    ],
};

export const SkeletonCellRendererModule: Module = {
    ...baseEnterpriseModule('SkeletonCellRendererModule'),
    userComponents: [
        {
            classImp: SkeletonCellRenderer,
            name: 'agSkeletonCellRenderer',
        },
    ],
};
