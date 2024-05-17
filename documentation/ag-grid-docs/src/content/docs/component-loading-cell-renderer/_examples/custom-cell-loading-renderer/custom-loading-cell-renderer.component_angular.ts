import { Component } from '@angular/core';

@Component({
    standalone: true,
    template: `<img src="https://www.ag-grid.com/example-assets/loading.gif" />`,
})
export class CustomLoadingCellRenderer {
    agInit(): void {}
}
