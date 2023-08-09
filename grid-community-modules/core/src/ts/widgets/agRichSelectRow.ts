import { UserCompDetails, UserComponentFactory } from "../components/framework/userComponentFactory";
import { Autowired, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { AgPromise } from "../utils";
import { bindCellRendererToHtmlElement } from "../utils/dom";
import { RichSelectParams } from "./agRichSelect";
import { FieldPickerValueSelectedEvent } from "../events";
import { Component } from "./component";
import { escapeString } from "../utils/string";

export class RichSelectRow<TValue> extends Component {

    private value: TValue;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    constructor(private readonly params: RichSelectParams<TValue>) {
        super(/* html */`<div class="ag-rich-select-row" role="presentation"></div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.getGui(), 'mouseup', this.onMouseUp.bind(this));
    }

    public setState(value: TValue, selected: boolean): void {
        let formattedValue = value;

        if (this.params.valueFormatter) {
            formattedValue = this.params.valueFormatter(value);
        }
        const rendererSuccessful = this.populateWithRenderer(formattedValue);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, formattedValue);
        }

        this.value = value;
        this.updateHighlighted(selected);
    }

    public updateHighlighted(highlighted: boolean): void {
        this.addOrRemoveCssClass('ag-rich-select-row-selected', highlighted);
    }

    private populateWithoutRenderer(value: any, valueFormatted: any) {
        const eGui = this.getGui();

        eGui.textContent = escapeString(valueFormatted ?? value) ?? '&nbsp;';
    }

    private populateWithRenderer(value: TValue): boolean {
        // bad coder here - we are not populating all values of the cellRendererParams
        let cellRendererPromise: AgPromise<any> | undefined;
        let userCompDetails: UserCompDetails | undefined;

        const { valueFormatter } = this.params;

        const valueFormatted = valueFormatter ? valueFormatter(value) : value;

        if (this.params.cellRenderer) {
            userCompDetails = this.userComponentFactory.getCellRendererDetails(this.params, {
                value,
                valueFormatted,
                api: this.gridOptionsService.api
            } as ICellRendererParams);
            
        }

        if (userCompDetails) {
            cellRendererPromise = userCompDetails.newAgStackInstance();
        }

        if (cellRendererPromise) {
            bindCellRendererToHtmlElement(cellRendererPromise, this.getGui());
        } else {
            this.getGui().innerText = value as unknown as string;
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

    private onMouseUp(): void {
        const parent = this.getParentComponent();
        const event: WithoutGridCommon<FieldPickerValueSelectedEvent> = {
            type: Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            fromEnterKey: false,
            value: this.value
        };

        parent?.dispatchEvent(event);
    }

}