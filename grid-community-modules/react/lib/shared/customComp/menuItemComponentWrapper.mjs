// @ag-grid-community/react v31.1.0
import { CustomComponentWrapper } from "./customComponentWrapper.mjs";
export class MenuItemComponentWrapper extends CustomComponentWrapper {
    constructor() {
        super(...arguments);
        this.active = false;
        this.expanded = false;
        this.onActiveChange = (active) => this.updateActive(active);
    }
    setActive(active) {
        this.awaitSetActive(active);
    }
    setExpanded(expanded) {
        this.expanded = expanded;
        this.refreshProps();
    }
    getOptionalMethods() {
        return ['select', 'configureDefaults'];
    }
    awaitSetActive(active) {
        this.active = active;
        return this.refreshProps();
    }
    updateActive(active) {
        const result = this.awaitSetActive(active);
        if (active) {
            result.then(() => this.sourceParams.onItemActivated());
        }
    }
    getProps() {
        const props = super.getProps();
        props.active = this.active;
        props.expanded = this.expanded;
        props.onActiveChange = this.onActiveChange;
        // remove props in IMenuItemParams but not CustomMenuItemProps
        delete props.onItemActivated;
        return props;
    }
}
