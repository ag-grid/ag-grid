import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { AnimateShowChangeCellRenderer } from './animateShowChangeCellRenderer';
import { AnimateSlideCellRenderer } from './animateSlideCellRenderer';
import { CheckboxCellRenderer } from './checkboxCellRenderer';

export const AnimateShowChangeCellRendererModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/animate-show-change-cell-renderer',
    userComponents: [
        {
            classImp: AnimateShowChangeCellRenderer,
            name: 'agAnimateShowChangeCellRenderer',
        },
    ],
});

export const AnimateSlideCellRendererModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/animate-slide-cell-renderer',
    userComponents: [
        {
            classImp: AnimateSlideCellRenderer,
            name: 'agAnimateSlideCellRenderer',
        },
    ],
});

export const CheckboxCellRendererModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/checkbox-cell-renderer',
    userComponents: [
        {
            classImp: CheckboxCellRenderer,
            name: 'agCheckboxCellRenderer',
        },
    ],
});
