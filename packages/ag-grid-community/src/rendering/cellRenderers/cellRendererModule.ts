import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { AnimateShowChangeCellRenderer } from './animateShowChangeCellRenderer';
import { AnimateSlideCellRenderer } from './animateSlideCellRenderer';
import { CheckboxCellRenderer } from './checkboxCellRenderer';

export const AnimateShowChangeCellRendererModule: _ModuleWithoutApi = {
    ...baseCommunityModule('AnimateShowChangeCellRendererModule'),
    userComponents: [
        {
            classImp: AnimateShowChangeCellRenderer,
            name: 'agAnimateShowChangeCellRenderer',
        },
    ],
};

export const AnimateSlideCellRendererModule: _ModuleWithoutApi = {
    ...baseCommunityModule('AnimateSlideCellRendererModule'),
    userComponents: [
        {
            classImp: AnimateSlideCellRenderer,
            name: 'agAnimateSlideCellRenderer',
        },
    ],
};

export const CheckboxCellRendererModule: _ModuleWithoutApi = {
    ...baseCommunityModule('CheckboxCellRendererModule'),
    userComponents: [
        {
            classImp: CheckboxCellRenderer,
            name: 'agCheckboxCellRenderer',
        },
    ],
};
