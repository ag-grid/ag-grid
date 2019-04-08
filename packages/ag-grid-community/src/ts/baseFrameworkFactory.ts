import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";

/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
export class BaseFrameworkFactory implements IFrameworkFactory {

    public setTimeout(action: any, timeout?: any): void {
        window.setTimeout(action, timeout);
    }
}