import _ from '../utils';
import {Logger} from "../logger";
import {LoggerFactory} from "../logger";

export interface ContextParams {
    seed: any,
    beans: (new()=>Object)[],
    debug: boolean
}

interface BeanEntry {
    beanInstance: any,
    beanName: any,
    initParams: string[]
}

export class Context {

    private beans: {[key: string]: BeanEntry} = {};
    private contextParams: ContextParams;
    private logger: Logger;

    public constructor(params: ContextParams) {

        if (!params || !params.beans) {
            return;
        }

        this.contextParams = params;

        this.logger = new Logger('Context', this.contextParams.debug);
        this.logger.log('ag-Grid: STARTING UP GRID CONTEXT');

        this.createBeans();
        this.initBeans();
        this.postInitBeans();
    }

    private createBeans(): void {
        this.contextParams.beans.forEach( (Bean: new()=>Object) => {
            var newInstance = new Bean();

            if (!(<any>newInstance).__agGrid) {
                console.error('context items ' + newInstance + ' is not a bean');
                return;
            }

            var metaData = (<any>newInstance).__agGrid;

            this.beans[metaData.beanName] = {
                beanInstance: newInstance,
                beanName: metaData.beanName,
                initParams: metaData.agInit
            };
        });
    }

    private initBeans(): void {
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            this.initialiseBean(beanEntry);
        });
    }

    private initialiseBean(beanEntry: BeanEntry): void {
        // if no init method, mark bean as initialised
        if (!beanEntry.beanInstance.agInit || !beanEntry.initParams) {
            return;
        }

        var initParams: any[] = [];
        _.iterateObject(beanEntry.initParams, (paramIndex: string, otherBeanName: string) => {
            var otherBean = this.lookupBeanInstance(beanEntry.beanName, otherBeanName);
            initParams[Number(paramIndex)] = otherBean;
        });

        if (this.contextParams.debug) {
            this.logger.log('initialising ' + beanEntry.beanName);
        }
        beanEntry.beanInstance.agInit.apply(beanEntry.beanInstance, initParams);
    }

    private lookupBeanInstance(wiringBean: string, beanName: string): any {
        if (beanName === 'context') {
            return this;
        } else if (this.contextParams.seed && this.contextParams.seed.hasOwnProperty(beanName)) {
            return this.contextParams.seed[beanName];
        } else {
            var beanEntry = this.beans[beanName];
            if (!beanEntry) {
                console.error('ag-Grid: unable to find bean reference ' + beanName + ' while initialising ' + wiringBean);
                return null;
            }
            return beanEntry.beanInstance;
        }
    }

    private postInitBeans(): void {
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            if (beanEntry.beanInstance.agPostInit) {
                beanEntry.beanInstance.agPostInit();
            }
        });
    }

    public destroy(): void {
        if (this.contextParams.debug) {
            this.logger.log('SHUTTING DOWN GRID CONTEXT');
        }
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            if (beanEntry.beanInstance.agDestroy) {
                if (this.contextParams.debug) {
                    console.log('ag-Grid: destroying ' + beanEntry.beanName);
                }
                beanEntry.beanInstance.agDestroy();
            }
        });
    }
}

export function Bean(beanName: string): Function {
    return (classConstructor: any) => {
        var props = getOrCreateProps(classConstructor.prototype);
        props.beanName = beanName;
    };
}

export function Qualifier(name: string): Function {
    return (classPrototype: any, methodName: string, index: number) => {

        var props = getOrCreateProps(classPrototype);

        if (!props[methodName]) {
            props[methodName] = {};
        }

        props[methodName][index] = name;
    };
}

function getOrCreateProps(target: any): any {

    var props = target.__agGrid;

    if (!props) {
        props = {};
        target.__agGrid = props;
    }

    return props;
}