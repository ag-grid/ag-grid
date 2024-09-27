import { defineCommunityModule } from '../../interfaces/iModule';
import { AnimateShowChangeCellRenderer } from './animateShowChangeCellRenderer';
import { AnimateSlideCellRenderer } from './animateSlideCellRenderer';
import { CheckboxCellRenderer } from './checkboxCellRenderer';

export const AnimateShowChangeCellRendererModule = defineCommunityModule(
    '@ag-grid-community/animate-show-change-cell-renderer',
    {
        userComponents: [
            {
                classImp: AnimateShowChangeCellRenderer,
                name: 'agAnimateShowChangeCellRenderer',
            },
        ],
    }
);

export const AnimateSlideCellRendererModule = defineCommunityModule('@ag-grid-community/animate-slide-cell-renderer', {
    userComponents: [
        {
            classImp: AnimateSlideCellRenderer,
            name: 'agAnimateSlideCellRenderer',
        },
    ],
});

export const CheckboxCellRendererModule = defineCommunityModule('@ag-grid-community/checkbox-cell-renderer', {
    userComponents: [
        {
            classImp: CheckboxCellRenderer,
            name: 'agCheckboxCellRenderer',
        },
    ],
});
