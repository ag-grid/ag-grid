import {IComponent, WrapableInterface} from 'ag-grid-community';

export abstract class BaseReactComponent implements IComponent<any>, WrapableInterface {
    hasMethod(name: string): boolean {
        let frameworkComponentInstance = this.getFrameworkComponentInstance();
        if (frameworkComponentInstance == null) {
            return false;
        }
        return frameworkComponentInstance[name] != null;
    }

    callMethod(name: string, args: IArguments): void {
        let frameworkComponentInstance = this.getFrameworkComponentInstance();

        // this should never happen now that AgGridReact.waitForInstance is in use
        if (frameworkComponentInstance == null) {
            window.setTimeout(() => this.callMethod(name, args), 100);
        } else {
            let method = this.getFrameworkComponentInstance()[name];
            if (method == null) return;
            return method.apply(frameworkComponentInstance, args);
        }
    }

    addMethod(name: string, callback: Function): void {
        (this as any)[name] = callback;
    }

    abstract getGui(): HTMLElement;
    abstract getFrameworkComponentInstance(): any;
}
