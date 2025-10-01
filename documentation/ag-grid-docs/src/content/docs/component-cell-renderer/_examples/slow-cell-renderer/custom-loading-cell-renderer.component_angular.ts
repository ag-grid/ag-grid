import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'custom-loading-cell-renderer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<img src="https://www.ag-grid.com/example-assets/loading.gif" />`,
})
export class CustomLoadingCellRenderer {
    agInit(): void {}
}
