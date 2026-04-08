import type { IconName } from 'ag-grid-community';
import { _resetColumnState } from 'ag-grid-community';

import { AbstractToolbarItemComp } from './abstractToolbarItemComp';

export class ResetColumnsToolbarItem extends AbstractToolbarItemComp {
    protected getIconName(): IconName {
        return 'minimize';
    }

    protected getLocaleKey(): string {
        return 'toolbarResetColumns';
    }

    protected getDefaultLabel(): string {
        return 'Reset Columns';
    }

    protected onAction(): void {
        _resetColumnState(this.beans, 'api');
    }
}
