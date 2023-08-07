import { UserCompDetails, UserComponentFactory } from "../components/framework/userComponentFactory";
import { Autowired, PostConstruct } from "../context/context";
import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { AgPromise } from "../utils";
import { bindCellRendererToHtmlElement } from "../utils/dom";
import { exists } from "../utils/generic";
import { AgRichSelect, IRichSelectParams } from "./agRichSelect";
import { Component } from "./component";

export class RichSelectRow extends Component {

    private value: any;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    constructor(private readonly params: IRichSelectParams) {
        super(/* html */`<div class="ag-rich-select-row" role="presentation"></div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.getGui(), 'mouseup', this.onMouseUp.bind(this));
    }

    public setState(value: any, selected: boolean): void {
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

    private populateWithoutRenderer(value: any, valueFormatted: string) {
        const valueToRender = valueFormatted ?? value;

        if (exists(valueToRender) && valueToRender !== '') {
            // not using innerHTML to prevent injection of HTML
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
            this.getGui().textContent = valueToRender.toString();
        } else {
            // putting in blank, so if missing, at least the user can click on it
            this.getGui().innerHTML = '&nbsp;';
        }
    }

    private populateWithRenderer(value: string): boolean {
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
            this.getGui().innerText = value;
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
        const richSelectComp = this.parentComponent as AgRichSelect;
        richSelectComp.setValue(this.value, false, true);
        richSelectComp.hidePicker();
    }

}