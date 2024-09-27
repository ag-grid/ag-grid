import { defineCommunityModule } from '../../interfaces/iModule';
import { AnimateShowChangeCellRenderer } from './animateShowChangeCellRenderer';
import { AnimateSlideCellRenderer } from './animateSlideCellRenderer';
import { CheckboxCellRenderer } from './checkboxCellRenderer';

export const AnimateShowChangeCellRendererModule = defineCommunityModule('AnimateShowChangeCellRendererModule', {
    userComponents: [
        {
            classImp: AnimateShowChangeCellRenderer,
            name: 'agAnimateShowChangeCellRenderer',
        },
    ],
});

export const AnimateSlideCellRendererModule = defineCommunityModule('AnimateSlideCellRendererModule', {
    userComponents: [
        {
            classImp: AnimateSlideCellRenderer,
            name: 'agAnimateSlideCellRenderer',
        },
    ],
});

export const CheckboxCellRendererModule = defineCommunityModule('CheckboxCellRendererModule', {
    userComponents: [
        {
            classImp: CheckboxCellRenderer,
            name: 'agCheckboxCellRenderer',
        },
    ],
});
