import { baseCommunityModule } from '../../interfaces/iModule';
import type { Module } from '../../interfaces/iModule';
import { AnimateShowChangeCellRenderer } from './animateShowChangeCellRenderer';
import { AnimateSlideCellRenderer } from './animateSlideCellRenderer';
import { CheckboxCellRenderer } from './checkboxCellRenderer';

export const AnimateShowChangeCellRendererModule: Module = {
    ...baseCommunityModule('AnimateShowChangeCellRendererModule'),
    userComponents: [
        {
            classImp: AnimateShowChangeCellRenderer,
            name: 'agAnimateShowChangeCellRenderer',
        },
    ],
};

export const AnimateSlideCellRendererModule: Module = {
    ...baseCommunityModule('AnimateSlideCellRendererModule'),
    userComponents: [
        {
            classImp: AnimateSlideCellRenderer,
            name: 'agAnimateSlideCellRenderer',
        },
    ],
};

export const CheckboxCellRendererModule: Module = {
    ...baseCommunityModule('CheckboxCellRendererModule'),
    userComponents: [
        {
            classImp: CheckboxCellRenderer,
            name: 'agCheckboxCellRenderer',
        },
    ],
};
