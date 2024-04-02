import { UserCompDetails, UserComponentFactory } from "../components/framework/userComponentFactory";
import { Autowired, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { AgPromise } from "../utils";
import { bindCellRendererToHtmlElement, getInnerWidth } from "../utils/dom";
import { RichSelectParams } from "./agRichSelect";
import { FieldPickerValueSelectedEvent } from "../events";
import { Component } from "./component";
import { escapeString } from "../utils/string";
import { exists } from "../utils/generic";
import { setAriaActiveDescendant, setAriaSelected } from "../utils/aria";
import { VirtualList } from "./virtualList";

export class RichSelectRow<TValue> extends Component {

    private value: TValue;
    private parsedValue: string | null;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    constructor(private readonly params: RichSelectParams<TValue>, private readonly wrapperEl: HTMLElement) {
        super(/* html */`<div class="ag-rich-select-row" role="presentation"></div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.getGui(), 'click', this.onClick.bind(this));
    }

    public setState(value: TValue): void {
        let formattedValue: string = ''

        if (this.params.valueFormatter) {
            formattedValue = this.params.valueFormatter(value);
        }
        const rendererSuccessful = this.populateWithRenderer(value, formattedValue);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, formattedValue);
        }

        this.value = value;
    }

    public highlightString(matchString: string): void {
        const { parsedValue } = this;

        if (this.params.cellRenderer || !exists(parsedValue)) { return; }

        let hasMatch = exists(matchString);

        if (hasMatch) {
            const index = parsedValue?.toLocaleLowerCase().indexOf(matchString.toLocaleLowerCase());
            if (index >= 0) {
                const highlightEndIndex = index + matchString.length;
                const startPart = escapeString(parsedValue.slice(0, index), true);
                const highlightedPart = escapeString(parsedValue.slice(index, highlightEndIndex), true);
                const endPart = escapeString(parsedValue.slice(highlightEndIndex));
                this.renderValueWithoutRenderer(`${startPart}<span class="ag-rich-select-row-text-highlight">${highlightedPart}</span>${endPart}`);
            } else {
                hasMatch = false;
            }
        }

        if (!hasMatch) {
            this.renderValueWithoutRenderer(parsedValue);
        }
    }

    public updateHighlighted(highlighted: boolean): void {
        const eGui = this.getGui();
        const parentId = `ag-rich-select-row-${this.getCompId()}`;

        eGui.parentElement?.setAttribute('id', parentId);

        if (highlighted) {
            const parentAriaEl = (this.getParentComponent() as VirtualList).getAriaElement();
            setAriaActiveDescendant(parentAriaEl, parentId);
            this.wrapperEl.setAttribute('data-active-option', parentId);
        }

        setAriaSelected(eGui.parentElement!, highlighted);
        this.addOrRemoveCssClass('ag-rich-select-row-selected', highlighted);
    }

    private populateWithoutRenderer(value: any, valueFormatted: any) {
        const eDocument = this.gos.getDocument();
        const eGui = this.getGui();

        const span = eDocument.createElement('span');
        span.style.overflow = 'hidden';
        span.style.textOverflow = 'ellipsis';
        const parsedValue = escapeString(exists(valueFormatted) ? valueFormatted : value, true);
        this.parsedValue = exists(parsedValue) ? parsedValue : null;

        eGui.appendChild(span);
        this.renderValueWithoutRenderer(parsedValue);
        this.setTooltip ({
            newTooltipText: this.parsedValue,
            shouldDisplayTooltip: () => span.scrollWidth > span.clientWidth
        });
    }

    private renderValueWithoutRenderer(value: string | null): void {
        const span = this.getGui().querySelector('span');
        if (!span) { return; }
        span.innerHTML = exists(value) ? value : '&nbsp;'
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
            bindCellRendererToHtmlElement(cellRendererPromise, this.getGui());
        }

        if (cellRendererPromise) {
            cellRendererPromise.then(childComponent => {
                this.addDestroyFunc(() => {
                    this.getContext().destroyBean(childComponent);
                });
            });
            return true;
        }
        return false;
    }

    private onClick(): void {
        const parent = this.getParentComponent();
        const event: WithoutGridCommon<FieldPickerValueSelectedEvent> = {
            type: Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            fromEnterKey: false,
            value: this.value
        };

        parent?.dispatchEvent(event);
    }

}