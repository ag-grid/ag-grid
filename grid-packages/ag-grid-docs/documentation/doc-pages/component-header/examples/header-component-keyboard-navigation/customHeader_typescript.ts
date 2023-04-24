import { IHeaderParams } from '@ag-grid-community/core';

export class CustomHeader {
    private eGui: HTMLElement | undefined;

  init(params: IHeaderParams) {
    this.eGui = document.createElement("div");
    this.eGui.classList.add('custom-header');
    this.eGui.innerHTML = `
        <span>${params.displayName}</span>
        <button>Click me</button>
        <input value="120"/>
        <a href="https://ag-grid.com" target="_blank">Link</a>`;
  }

  getGui() {
    return this.eGui!;
  }

  refresh(params: IHeaderParams): boolean {
    return false;
  }
}
