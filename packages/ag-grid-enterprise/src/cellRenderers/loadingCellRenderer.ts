import { RefPlaceholder } from 'ag-stack';

import type { ElementParams, ILoadingCellRendererComp, ILoadingCellRendererParams } from 'ag-grid-community';
import { Component, _createIconNoSpan } from 'ag-grid-community';

import { getCellWidgetsWidth } from './cellWidgetUtils';

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
        const { beans, gos } = this;
        const setIndent = () => {
            const groupCols = beans.showRowGroupCols?.columns ?? [];
            // by level, as uiLevel skips unbalanced groups; leaf rows and tree data use the last group column
            const groupCol =
                beans.rowGroupColsSvc?.columns[node.level]?.showRowGroupCol ?? groupCols[groupCols.length - 1];
            const displayedCols = beans.visibleCols.allCols;
            const groupColIndex = groupCol ? displayedCols.indexOf(groupCol) : -1;
            const colDef = groupColIndex >= 0 ? groupCol?.getColDef() : undefined;
            // without a group column, a full width group row draws the chevron
            const groupRowParams = groupCol ? undefined : gos.get('groupRowRendererParams');
            const suppressPadding = (colDef?.cellRendererParams ?? groupRowParams)?.suppressPadding;
            // as in the group cell renderer, only a single group column without suppressPadding indents by level
            const level = suppressPadding || (colDef && colDef.showRowGroup !== true) ? 0 : node.uiLevel;

            let offset = getCellWidgetsWidth(beans.environment, colDef ?? groupRowParams);
            for (let i = 0; i < groupColIndex; ++i) {
                offset += displayedCols[i].getActualWidth();
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
