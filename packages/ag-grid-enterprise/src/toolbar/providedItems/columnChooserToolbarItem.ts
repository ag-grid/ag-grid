import type { IconName } from 'ag-grid-community';

import type { ColumnChooserFactory } from '../../menu/columnChooserFactory';
import { AbstractToolbarItemComp } from './abstractToolbarItemComp';

export class ColumnChooserToolbarItem extends AbstractToolbarItemComp {
    protected getIconName(): IconName {
        return 'columns';
    }

    protected getLocaleKey(): string {
        return 'toolbarColumnChooser';
    }

    protected getDefaultLabel(): string {
        return 'Columns';
    }

    protected onAction(): void {
        const colChooserFactory = this.beans.colChooserFactory as ColumnChooserFactory | undefined;
        colChooserFactory?.showColumnChooser({ eventSource: this.getGui() });
    }
}
