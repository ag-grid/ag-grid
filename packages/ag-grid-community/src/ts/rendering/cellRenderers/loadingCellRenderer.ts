import { Autowired } from "../../context/context";
import { Component } from "../../widgets/component";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { ICellRenderer, ICellRendererParams } from "./iCellRenderer";
import { RefSelector } from "../../widgets/componentAnnotations";
import { _ } from "../../utils";

export interface ILoadingCellRendererParams extends ICellRendererParams {}
export interface ILoadingCellRenderer extends ICellRenderer {}

export class LoadingCellRenderer extends Component implements ILoadingCellRenderer {

    private static TEMPLATE =
        `<div class="ag-stub-cell">
            <span class="ag-loading-icon" ref="eLoadingIcon"></span>
            <span class="ag-loading-text" ref="eLoadingText"></span>
        </div>`;

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eLoadingIcon') private eLoadingIcon: HTMLElement;
    @RefSelector('eLoadingText') private eLoadingText: HTMLElement;

    constructor() {
        super(LoadingCellRenderer.TEMPLATE);
    }

    public init(params: ILoadingCellRendererParams): void {
        const eLoadingIcon = _.createIconNoSpan('groupLoading', this.gridOptionsWrapper, null);
        this.eLoadingIcon.appendChild(eLoadingIcon);

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eLoadingText.innerText = localeTextFunc('loadingOoo', 'Loading');
    }

    public refresh(params: any): boolean {
        return false;
    }
}