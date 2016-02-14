import _ from '../utils';
import {Logger} from "../logger";
import {LoggerFactory} from "../logger";

export interface ContextParams {
    seed: any,
    beans: any[],
    overrideBeans: any[],
    debug: boolean
}

interface BeanEntry {
    bean: any,
    beanInstance: any,
    beanName: any,
    wireParams: string[],
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
        this.logger.log('>> creating ag-Application Context');

        this.createBeans();
        this.autoWireBeans();
        this.wireBeans();
        this.postWire();
        this.wireCompleteBeans();

        this.logger.log('>> ag-Application Context ready - component is alive');
    }

    private createBeans(): void {

        // register all normal beans
        this.contextParams.beans.forEach(this.createBeanEntry.bind(this));
        // register override beans, these will overwrite beans above of same name
        if (this.contextParams.overrideBeans) {
            this.contextParams.overrideBeans.forEach(this.createBeanEntry.bind(this));
        }

        // instantiate all beans - overridden beans will be left out
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            var constructorParams = this.getBeansForParameters(beanEntry.constructorParams, beanEntry.beanName);
            var newInstance = applyToConstructor(beanEntry.bean, constructorParams);
            beanEntry.beanInstance = newInstance;
        });
    }

    private createBeanEntry(Bean: new()=>Object): void {

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
            bean: Bean,
            beanInstance: <any> null,
            beanName: metaData.beanName,
            wireParams: metaData.agWire,
            constructorParams: metaData.agConstructor,
            attributes: metaData.agClassAttributes
        };

        this.beans[metaData.beanName] = beanEntry;
    }

    private autoWireBeans(): void {
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            this.autoWireBean(beanEntry);
        });
    }

    private wireBeans(): void {
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            this.wireBean(beanEntry);
        });
    }

    private autoWireBean(beanEntry: BeanEntry): void {
        // if no init method, mark bean as initialised
        if (!beanEntry.attributes) {
            return;
        }

        this.logger.log('auto-wiring ' + beanEntry.beanName);

        _.iterateObject(beanEntry.attributes, (attribute: string, otherBeanName: string) => {
            var otherBean = this.lookupBeanInstance(beanEntry.beanName, otherBeanName);
            beanEntry.beanInstance[attribute] = otherBean;
        });
    }

    private wireBean(beanEntry: BeanEntry): void {
        // if no init method, skip he bean
        if (!beanEntry.beanInstance.agWire) {
            return;
        }

        var initParams = this.getBeansForParameters(beanEntry.wireParams, beanEntry.beanName);

        this.logger.log('wiring ' + beanEntry.beanName);
        beanEntry.beanInstance.agWire.apply(beanEntry.beanInstance, initParams);
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

    private postWire(): void {
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            if (beanEntry.beanInstance.agPostWire) {
                this.logger.log('post-wire ' + beanEntry.beanName);
                beanEntry.beanInstance.agPostWire();
            }
        });
    }

    private wireCompleteBeans(): void {
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            if (beanEntry.beanInstance.agApplicationBoot) {
                this.logger.log('application-boot ' + beanEntry.beanName);
                beanEntry.beanInstance.agApplicationBoot();
            }
        });
    }

    public destroy(): void {
        this.logger.log('>> Shutting down ag-Application Context');
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            if (beanEntry.beanInstance.agDestroy) {
                if (this.contextParams.debug) {
                    console.log('ag-Grid: destroying ' + beanEntry.beanName);
                }
                beanEntry.beanInstance.agDestroy();
            }
        });
        this.logger.log('>> ag-Application Context shut down - component is dead');
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