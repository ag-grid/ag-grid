import { UserCompDetails } from "../components/framework/userComponentFactory";
import { PostConstruct } from "../context/context";
import { AgPromise } from "../utils";
import { bindCellRendererToHtmlElement } from "../utils/dom";
import { exists } from "../utils/generic";
import { AgRichSelect } from "./agRichSelect";
import { Component } from "./component";

export class RichSelectRow extends Component {

    private value: any;

    constructor(private readonly userCompDetails?: UserCompDetails) {
        super(/* html */`<div class="ag-rich-select-row" role="presentation"></div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.getGui(), 'mouseup', this.onMouseUp.bind(this));
    }

    public setState(value: any, valueFormatted: string, selected: boolean): void {
        const rendererSuccessful = this.populateWithRenderer(valueFormatted);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, valueFormatted);
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

        if (cellRendererPromise) {
            cellRendererPromise = this.userCompDetails?.newAgStackInstance();
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

    private onMouseUp(e: MouseEvent): void {
        const richSelectComp = this.parentComponent as AgRichSelect;
        richSelectComp.setValue(this.value, false, true);
    }

}