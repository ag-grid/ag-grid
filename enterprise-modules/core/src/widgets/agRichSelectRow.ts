import type {
    AgPromise,
    BeanCollection,
    ICellRendererParams,
    RichSelectParams,
    UserCompDetails,
    UserComponentFactory,
} from '@ag-grid-community/core';
import {
    Component,
    _bindCellRendererToHtmlElement,
    _escapeString,
    _exists,
    _setAriaActiveDescendant,
    _setAriaSelected,
} from '@ag-grid-community/core';

import type { VirtualList } from './virtualList';

export class RichSelectRow<TValue> extends Component {
    private userComponentFactory: UserComponentFactory;

    public wireBeans(beans: BeanCollection) {
        this.userComponentFactory = beans.userComponentFactory;
    }

    private value: TValue;
    private parsedValue: string | null;

    constructor(
        private readonly params: RichSelectParams<TValue>,
        private readonly wrapperEl: HTMLElement,
        private readonly isItemSelected: (value: TValue) => boolean
    ) {
        super(/* html */ `<div class="ag-rich-select-row" role="presentation"></div>`);
    }

    public setState(value: TValue): void {
        let formattedValue: string = '';

        const { params } = this;

        if (params.valueFormatter) {
            formattedValue = params.valueFormatter(value);
        }
        const rendererSuccessful = this.populateWithRenderer(value, formattedValue);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, formattedValue);
        }

        this.value = value;

        if (this.isItemSelected(value)) {
            this.updateSelected(true);
        }
    }

    public highlightString(matchString: string): void {
        const { parsedValue } = this;

        if (this.params.cellRenderer || !_exists(parsedValue)) {
            return;
        }

        let hasMatch = _exists(matchString);

        if (hasMatch) {
            const index = parsedValue?.toLocaleLowerCase().indexOf(matchString.toLocaleLowerCase());
            if (index >= 0) {
                const highlightEndIndex = index + matchString.length;
                const startPart = _escapeString(parsedValue.slice(0, index), true);
                const highlightedPart = _escapeString(parsedValue.slice(index, highlightEndIndex), true);
                const endPart = _escapeString(parsedValue.slice(highlightEndIndex));
                this.renderValueWithoutRenderer(
                    `${startPart}<span class="ag-rich-select-row-text-highlight">${highlightedPart}</span>${endPart}`
                );
            } else {
                hasMatch = false;
            }
        }

        if (!hasMatch) {
            this.renderValueWithoutRenderer(parsedValue);
        }
    }

    public updateSelected(selected: boolean): void {
        const eGui = this.getGui();
        _setAriaSelected(eGui.parentElement!, selected);

        this.addOrRemoveCssClass('ag-rich-select-row-selected', selected);
    }

    public getValue(): TValue {
        return this.value;
    }

    public updateHighlighted(highlighted: boolean): void {
        const eGui = this.getGui();
        const parentId = `ag-rich-select-row-${this.getCompId()}`;

        eGui.parentElement?.setAttribute('id', parentId);

        if (highlighted) {
            const parentAriaEl = (this.getParentComponent() as VirtualList<any>).getAriaElement();
            _setAriaActiveDescendant(parentAriaEl, parentId);
            this.wrapperEl.setAttribute('data-active-option', parentId);
        }

        this.addOrRemoveCssClass('ag-rich-select-row-highlighted', highlighted);
    }

    private populateWithoutRenderer(value: any, valueFormatted: any) {
        const eDocument = this.gos.getDocument();
        const eGui = this.getGui();

        const span = eDocument.createElement('span');
        span.style.overflow = 'hidden';
        span.style.textOverflow = 'ellipsis';
        const parsedValue = _escapeString(_exists(valueFormatted) ? valueFormatted : value, true);
        this.parsedValue = _exists(parsedValue) ? parsedValue : null;

        eGui.appendChild(span);
        this.renderValueWithoutRenderer(parsedValue);
        this.setTooltip({
            newTooltipText: this.parsedValue,
            shouldDisplayTooltip: () => span.scrollWidth > span.clientWidth,
        });
    }

    private renderValueWithoutRenderer(value: string | null): void {
        const span = this.getGui().querySelector('span');
        if (!span) {
            return;
        }
        span.innerHTML = _exists(value) ? value : '&nbsp;';
    }

    private populateWithRenderer(value: TValue, valueFormatted: string): boolean {
        // bad coder here - we are not populating all values of the cellRendererParams
        let cellRendererPromise: AgPromise<any> | undefined;
        let userCompDetails: UserCompDetails | undefined;

        if (this.params.cellRenderer) {
            userCompDetails = this.userComponentFactory.getCellRendererDetails(this.params, {
                value,
                valueFormatted,
                setTooltip: (value: string, shouldDisplayTooltip: () => boolean) => {
                    this.setTooltip({ newTooltipText: value, shouldDisplayTooltip });
                },
            } as ICellRendererParams);
        }

        if (userCompDetails) {
            cellRendererPromise = userCompDetails.newAgStackInstance();
        }

        if (cellRendererPromise) {
            _bindCellRendererToHtmlElement(cellRendererPromise, this.getGui());
        }

        if (cellRendererPromise) {
            cellRendererPromise.then((childComponent) => {
                this.addDestroyFunc(() => {
                    this.destroyBean(childComponent);
                });
            });
            return true;
        }
        return false;
    }
}
