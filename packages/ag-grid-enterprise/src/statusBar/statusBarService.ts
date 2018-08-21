import {Bean, Component} from 'ag-grid-community';

@Bean('statusBarService')
export class StatusBarService {

    private allComponents: { [p: string]: Component } = {};

    constructor() {
    }

    public registerStatusBarComponent(key: string, component: Component): void {
        this.allComponents[key] = component;
    }

    public getStatusBarComponent(key: string): Component {
        return this.allComponents[key];
    }
}
