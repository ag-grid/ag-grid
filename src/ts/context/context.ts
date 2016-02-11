import _ from '../utils';
import {Logger} from "../logger";
import {LoggerFactory} from "../logger";

export interface ContextParams {
    seed: any,
    beans: any[],
    debug: boolean
}

interface BeanEntry {
    beanInstance: any,
    beanName: any,
    initParams: string[],
    constructorParams: string[],
    attributes: any
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
        this.setAttributesOnBeans();
        this.initBeans();
        this.postInitBeans();
        this.initCompleteBeans();
    }

    private createBeans(): void {
        this.contextParams.beans.forEach( (Bean: new()=>Object) => {

            var metaData = Bean.prototype.__agBeanMetaData;

            if (!metaData) {
                var beanName: string;
                if (Bean.prototype.constructor) {
                    beanName = Bean.prototype.constructor.name;
                } else {
                    beanName = ''+Bean;
                }
                console.error('context item ' + beanName + ' is not a bean');
                return;
            }

            var beanEntry = {
                beanInstance: <any> null,
                beanName: metaData.beanName,
                initParams: metaData.agInit,
                constructorParams: metaData.agConstructor,
                attributes: metaData.agClassAttributes
            };

            this.beans[metaData.beanName] = beanEntry;

            var constructorParams = this.getBeansForParameters(beanEntry.constructorParams, beanEntry.beanName);
            var newInstance = applyToConstructor(Bean, constructorParams);

            beanEntry.beanInstance = newInstance;
        });
    }

    private setAttributesOnBeans(): void {
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            this.setAttributesOnBean(beanEntry);
        });
    }

    private initBeans(): void {
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            this.initialiseBean(beanEntry);
        });
    }

    private setAttributesOnBean(beanEntry: BeanEntry): void {
        // if no init method, mark bean as initialised
        if (!beanEntry.attributes) {
            return;
        }

        _.iterateObject(beanEntry.attributes, (attribute: string, otherBeanName: string) => {
            var otherBean = this.lookupBeanInstance(beanEntry.beanName, otherBeanName);
            beanEntry.beanInstance[attribute] = otherBean;
        });

        this.logger.log('setting attributes ' + beanEntry.beanName);
    }

    private initialiseBean(beanEntry: BeanEntry): void {
        // if no init method, mark bean as initialised
        if (!beanEntry.beanInstance.agInit || !beanEntry.initParams) {
            return;
        }

        var initParams = this.getBeansForParameters(beanEntry.initParams, beanEntry.beanName);
        //_.iterateObject(beanEntry.initParams, (paramIndex: string, otherBeanName: string) => {
        //    var otherBean = this.lookupBeanInstance(beanEntry.beanName, otherBeanName);
        //    initParams[Number(paramIndex)] = otherBean;
        //});

        this.logger.log('initialising ' + beanEntry.beanName);
        beanEntry.beanInstance.agInit.apply(beanEntry.beanInstance, initParams);
    }

    private getBeansForParameters(parameters: any, beanName: string): any[] {
        var beansList: any[] = [];
        if (parameters) {
            _.iterateObject(parameters, (paramIndex: string, otherBeanName: string) => {
                var otherBean = this.lookupBeanInstance(beanName, otherBeanName);
                beansList[Number(paramIndex)] = otherBean;
            });
        }
        return beansList;
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

    private initCompleteBeans(): void {
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            if (beanEntry.beanInstance.agInitComplete) {
                beanEntry.beanInstance.agInitComplete();
            }
        });
    }

    public destroy(): void {
        this.logger.log('SHUTTING DOWN GRID CONTEXT');
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

// taken from: http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
// allows calling 'apply' on a constructor
function applyToConstructor(constructor: Function, argArray: any[]) {
    var args = [null].concat(argArray);
    var factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}

export function Bean(beanName: string): Function {
    return (classConstructor: any) => {
        var props = getOrCreateProps(classConstructor.prototype);
        props.beanName = beanName;
    };
}

export function Qualifier(name: string): Function {
    return (classPrototype: any, methodOrAttributeName: string, index: number) => {

        var props: any;

        if (typeof index === 'number') {
            // it's a parameter on a method
            if (methodOrAttributeName!=='agInit') {
                console.log('asf');
            }
            var methodName: string;
            if (methodOrAttributeName) {
                props = getOrCreateProps(classPrototype);
                methodName = methodOrAttributeName;
            } else {
                props = getOrCreateProps(classPrototype.prototype);
                methodName = 'agConstructor';
            }
            if (!props[methodName]) {
                props[methodName] = {};
            }
            props[methodName][index] = name;
        } else {
            // it's an attribute on the class
            var props = getOrCreateProps(classPrototype);
            if (!props.agClassAttributes) {
                props.agClassAttributes = {};
            }
            props.agClassAttributes[methodOrAttributeName] = name;
        }

    };
}

function getOrCreateProps(target: any): any {

    var props = target.__agBeanMetaData;

    if (!props) {
        props = {};
        target.__agBeanMetaData = props;
    }

    return props;
}