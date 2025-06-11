import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { CheckboxCellRenderer } from './checkboxCellRenderer';
import { SkeletonCellRenderer } from './skeletonCellRenderer';

/**
 * @feature Cells -> Cell Data Types
 * @colDef cellDataType
 */
export const CheckboxCellRendererModule: _ModuleWithoutApi = {
    moduleName: 'CheckboxCellRenderer',
    version: VERSION,
    userComponents: {
        agCheckboxCellRenderer: CheckboxCellRenderer,
    },
};

/**
 * @internal
 */
export const SkeletonCellRendererModule: _ModuleWithoutApi = {
    moduleName: 'SkeletonCellRenderer',
    version: VERSION,
    userComponents: {
        agSkeletonCellRenderer: SkeletonCellRenderer,
    },
};
