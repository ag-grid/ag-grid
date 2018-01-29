import {bindable, customElement, inject} from "aurelia-framework";

@customElement('ag-header-group-component')
@inject(Element)
export class HeaderGroupComponent {
    params: any;

    @bindable() expanded: boolean;

    element: any;

    constructor(element) {
        this.element = element;

        this.onExpandChanged = this.onExpandChanged.bind(this);
    }


    attached(): void {
        this.params.columnGroup.getOriginalColumnGroup().addEventListener('expandedChanged', this.onExpandChanged);
    }

    detached() {
        this.params.columnGroup.getOriginalColumnGroup().removeEventListener('expandedChanged', this.onExpandChanged);
    }

    expandOrCollapse() {
        this.params.setExpanded(!this.expanded);
    };

    onExpandChanged() {
        this.expanded = this.params.columnGroup.getOriginalColumnGroup().isExpanded()
    }

}
