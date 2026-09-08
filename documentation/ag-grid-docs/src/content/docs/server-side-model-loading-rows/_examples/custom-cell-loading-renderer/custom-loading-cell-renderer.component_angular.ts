import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<img src="https://www.ag-grid.com/example-assets/loading.gif" />`,
})
export class CustomLoadingCellRenderer {
    agInit(): void {}
}
