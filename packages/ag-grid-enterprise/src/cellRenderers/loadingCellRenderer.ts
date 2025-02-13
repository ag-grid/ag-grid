import type {
    ColumnPinnedType,
    ILoadingCellRendererComp,
    ILoadingCellRendererParams,
    IRowNode,
} from 'ag-grid-community';
import { Component, RefPlaceholder, _createIconNoSpan } from 'ag-grid-community';

export class LoadingCellRenderer extends Component implements ILoadingCellRendererComp {
    private readonly eLoadingIcon: HTMLElement = RefPlaceholder;
    private readonly eLoadingText: HTMLElement = RefPlaceholder;

    constructor() {
        super(/* html */ `<div class="ag-loading">
            <span class="ag-loading-icon" data-ref="eLoadingIcon"></span>
            <span class="ag-loading-text" data-ref="eLoadingText"></span>
        </div>`);
    }

    public init(params: ILoadingCellRendererParams): void {
        const { node, pinned } = params;
        node.failedLoad ? this.setupFailed() : this.setupLoading();

        if (this.gos.get('rowNumbers')) {
            this.injectRowNumbersAtStart(node, pinned);
        }
    }

    private injectRowNumbersAtStart(node: IRowNode, pinned?: ColumnPinnedType): void {
        const { gos } = this;
        const { rowNumbersSvc } = this.beans;

        if (!rowNumbersSvc) {
            return;
        }

        const columns = rowNumbersSvc.getColumns();

        if (!columns?.length) {
            return;
        }

        const isEmbedFullWidthRows = gos.get('embedFullWidthRows');
        const isRtl = gos.get('enableRtl');
        const isLeftPinned = pinned === true || pinned === 'left';

        if (isEmbedFullWidthRows && (!pinned || isLeftPinned === isRtl)) {
            return;
        }

        const eGui = this.getGui();
        const propSuffix = gos.get('enableRtl') ? 'right' : 'left';
        eGui.style.setProperty(`padding-${propSuffix}`, '0');
        const cell = rowNumbersSvc?.getPlaceholderCellForNode(node);

        if (cell) {
            this.addManagedEventListeners({
                columnResized: () => cell.style.setProperty('width', `${columns[0].getActualWidth()}px`),
            });
            eGui.insertAdjacentElement('afterbegin', cell);
        }
    }

    private setupFailed(): void {
        const localeTextFunc = this.getLocaleTextFunc();
        // eslint-disable-next-line no-restricted-properties -- Could swap to textContent, but could be a breaking change
        this.eLoadingText.innerText = localeTextFunc('loadingError', 'ERR');
    }

    private setupLoading(): void {
        const eLoadingIcon = _createIconNoSpan('groupLoading', this.beans, null);
        if (eLoadingIcon) {
            this.eLoadingIcon.appendChild(eLoadingIcon);
        }

        const localeTextFunc = this.getLocaleTextFunc();
        // eslint-disable-next-line no-restricted-properties -- Could swap to textContent, but could be a breaking change
        this.eLoadingText.innerText = localeTextFunc('loadingOoo', 'Loading');
    }

    public refresh(_params: ILoadingCellRendererParams): boolean {
        return false;
    }
}
