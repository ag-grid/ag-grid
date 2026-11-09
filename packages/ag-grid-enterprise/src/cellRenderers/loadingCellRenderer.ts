import { RefPlaceholder } from 'ag-stack';

import type { ElementParams, ILoadingCellRendererComp, ILoadingCellRendererParams } from 'ag-grid-community';
import { Component, _createIconNoSpan } from 'ag-grid-community';

const LoadingCellRendererElement: ElementParams = {
    tag: 'div',
    cls: 'ag-loading',
    children: [
        { tag: 'span', ref: 'eLoadingIcon', cls: 'ag-loading-icon' },
        { tag: 'span', ref: 'eLoadingText', cls: 'ag-loading-text' },
    ],
};
export class LoadingCellRenderer extends Component implements ILoadingCellRendererComp {
    private readonly eLoadingIcon: HTMLElement = RefPlaceholder;
    private readonly eLoadingText: HTMLElement = RefPlaceholder;

    constructor() {
        super(LoadingCellRendererElement);
    }

    public init(params: ILoadingCellRendererParams): void {
        if (params.node.failedLoad) {
            this.setupFailed();
        } else {
            this.setupLoading();
        }

        const { gos } = this;
        if (params.fullWidth && !gos.get('embedFullWidthRows') && gos.get('domLayout') !== 'print') {
            this.setupIndent(params);
        }
    }

    private setupFailed(): void {
        this.eLoadingText.textContent = this.getLocaleTextFunc()('loadingError', 'ERR');
    }

    private setupLoading(): void {
        const eLoadingIcon = _createIconNoSpan('groupLoading', this.beans, null);
        if (eLoadingIcon) {
            this.eLoadingIcon.appendChild(eLoadingIcon);
        }

        this.eLoadingText.textContent = this.getLocaleTextFunc()('loadingOoo', 'Loading...');
    }

    /** Lines the spinner up with the expand/collapse chevron of the rows being loaded. */
    private setupIndent({ node }: ILoadingCellRendererParams): void {
        const setIndent = () => {
            const { showRowGroupCols, rowGroupColsSvc, visibleCols, environment } = this.beans;
            // select by level, as uiLevel skips unbalanced groups; leaf rows and tree data fall back to the last group column
            const groupCols = showRowGroupCols?.columns ?? [];
            const groupCol = rowGroupColsSvc?.columns[node.level]?.showRowGroupCol ?? groupCols[groupCols.length - 1];
            const displayedCols = visibleCols.allCols;
            const groupColIndex = groupCol ? displayedCols.indexOf(groupCol) : -1;

            let level = node.uiLevel;
            let offset = 0;
            if (groupCol && groupColIndex >= 0) {
                const colDef = groupCol.getColDef();
                // as with the group cell renderer, only a single group column without suppressPadding indents by level
                if (colDef.showRowGroup !== true || colDef.cellRendererParams?.suppressPadding) {
                    level = 0;
                }

                // allCols is in display order, so this also holds in RTL
                for (let i = 0; i < groupColIndex; i++) {
                    offset += displayedCols[i].getActualWidth();
                }

                // Reserve space for the maximum number of widgets that can appear before the group cell's chevron
                const widgets =
                    (colDef.rowDrag ? 1 : 0) + (colDef.checkboxSelection ? 1 : 0) + (colDef.dndSource ? 1 : 0);
                offset += widgets * (environment.getDefaultIconSize() + environment.getDefaultCellWidgetSpacing());
            } else if (!groupCol && this.gos.get('groupRowRendererParams')?.suppressPadding) {
                level = 0;
            }

            const style = this.getGui().style;
            style.setProperty('--ag-internal-loading-row-offset', `${offset}px`);
            style.setProperty('--ag-internal-loading-row-level', String(level));
        };

        this.addManagedListeners(node, { uiLevelChanged: setIndent });
        this.addManagedEventListeners({ displayedColumnsChanged: setIndent, columnResized: setIndent });
        setIndent();
    }

    public refresh(_params: ILoadingCellRendererParams): boolean {
        return false;
    }
}
