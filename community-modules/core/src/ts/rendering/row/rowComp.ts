import { Component } from "../../widgets/component";
import { RowContainerComp } from "../../gridBodyComp/rowContainer/rowContainerComp";

export class RowComp extends Component {

    private container: RowContainerComp;

    constructor(eGui: HTMLElement, container: RowContainerComp) {
        super();
        this.setGui(eGui);
        this.container = container;
    }

    public getContainer(): RowContainerComp {
        return this.container;
    }

}
