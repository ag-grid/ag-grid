import {Autowired, Component, Context} from "ag-grid/main";
import {RefSelector} from "ag-grid";

export class ToolPanelFilterComp extends Component {

    private static TEMPLATE =
        `<div class="ag-column-panel">
            DAFILTERS!
        </div>`;

    @Autowired("context") private context: Context;

    @RefSelector('eColumnPanelCenter')
    private eCenterPanel: HTMLElement;

    private childDestroyFuncs: Function[] = [];


    constructor() {
        super(ToolPanelFilterComp.TEMPLATE);
    }

    public init(): void {
        this.instantiate(this.context);
    }


    public refresh(): void {

    }


}