import {IFilter, IFilterParams, IDoesFilterPassParams, RowNode, IAfterGuiAttachedParams} from "ag-grid/main";

export default class PartialMatchFilter implements IFilter {
  private params: IFilterParams;
  private valueGetter: (rowNode: RowNode) => any;
  private filterText: any;
  private eGui: HTMLElement;
  private eFilterText: any;

  public init(params: IFilterParams): void {
    this.params = params;
    this.filterText = null;
    this.valueGetter = params.valueGetter;
  };

  public getGui() {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
      '<input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/>';

    this.eFilterText = this.eGui.querySelector('#filterText');
    this.eFilterText.addEventListener("changed", listener);
    this.eFilterText.addEventListener("paste", listener);
    this.eFilterText.addEventListener("input", listener);
    // IE doesn't fire changed for special keys (eg delete, backspace), so need to
    // listen for this further ones
    this.eFilterText.addEventListener("keydown", listener);
    this.eFilterText.addEventListener("keyup", listener);

    var that = this;

    function listener(event) {
      that.filterText = event.target.value;
      that.params.filterChangedCallback();
    }

    return this.eGui;
  };

  isFilterActive(): boolean {
    return this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    // make sure each word passes separately, ie search for firstname, lastname
    let passed = true;
    this.filterText.toLowerCase().split(" ").forEach((filterWord) => {
      let value = this.valueGetter(<any>params);
      if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
        passed = false;
      }
    });
    return passed;
  }

  getModel(): any {
    var model = {value: this.filterText.value};
    return model;
  }

  setModel(model: any): void {
    this.eFilterText.value = model ? model.value : '';
  }

  afterGuiAttached(params: IAfterGuiAttachedParams): void {
    this.eGui.focus();
  }
}

