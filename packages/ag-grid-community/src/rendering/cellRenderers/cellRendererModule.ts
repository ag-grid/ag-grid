import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { AnimateShowChangeCellRenderer } from './animateShowChangeCellRenderer';
import { AnimateSlideCellRenderer } from './animateSlideCellRenderer';
import { CheckboxCellRenderer } from './checkboxCellRenderer';

export const AnimateShowChangeCellRendererModule: _ModuleWithoutApi = {
    ...baseCommunityModule('AnimateShowChangeCellRendererModule'),
    userComponents: {
        agAnimateShowChangeCellRenderer: AnimateShowChangeCellRenderer,
    },
};

export const AnimateSlideCellRendererModule: _ModuleWithoutApi = {
    ...baseCommunityModule('AnimateSlideCellRendererModule'),
    userComponents: {
        agAnimateSlideCellRenderer: AnimateSlideCellRenderer,
    },
};

export const CheckboxCellRendererModule: _ModuleWithoutApi = {
    ...baseCommunityModule('CheckboxCellRendererModule'),
    userComponents: {
        agCheckboxCellRenderer: CheckboxCellRenderer,
    },
};
