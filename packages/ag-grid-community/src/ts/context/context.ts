import { ILogger } from "../iLogger";
import { Component } from "../widgets/component";
import { _ } from "../utils";
import { ModuleNames } from "../modules/moduleNames";

// steps in booting up:
// 1. create all beans
// 2. autowire all attributes
// 3. wire all beans
// 4. initialise the model
// 5. initialise the view
// 6. boot??? (not sure if this is needed)
// each bean is responsible for initialising itself, taking items from the gridOptionsWrapper

export interface ContextParams {
    seed: any;
    beans: any[];
    components: ComponentMeta[];
    enterpriseDefaultComponents: any[];
    overrideBeans: any[];
    registeredModules: string[];
    debug: boolean;
}

export interface ComponentMeta {
    theClass: new () => Object;
    componentName: string;
}

interface BeanWrapper {
    bean: any;
    beanInstance: any;
    beanName: any;
}

export class Context {

    private beanWrappers: { [key: string]: BeanWrapper } = {};
    private contextParams: ContextParams;
    private logger: ILogger;

    private registeredModules: string[] = [];

    private componentsMappedByName: { [key: string]: any } = {};

    private destroyed = false;

    public constructor(params: ContextParams, logger: ILogger) {
        if (!params || !params.beans) {
            return;
        }

        this.contextParams = params;

        this.registeredModules = params.registeredModules;

        this.logger = logger;
        this.logger.log(">> creating ag-Application Context");

        this.setupComponents();

        this.createBeans();

        const beanInstances = this.getBeanInstances();

        this.wireBeans(beanInstances);

        this.logger.log(">> ag-Application Context ready - component is alive");
    }

    private getBeanInstances(): any[] {
        return _.mapObject(this.beanWrappers, beanEntry => beanEntry.beanInstance);
    }

    private setupComponents(): void {
        if (this.contextParams.components) {
            this.contextParams.components.forEach(componentMeta => this.addComponent(componentMeta));
        }
    }

    private addComponent(componentMeta: ComponentMeta): void {
        // get name of the class as a string
        // let className = _.getNameOfClass(ComponentClass);
        // insert a dash after every capital letter
        // let classEscaped = className.replace(/([A-Z])/g, "-$1").toLowerCase();
        const classEscaped = componentMeta.componentName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
        // put all to upper case
        const classUpperCase = classEscaped.toUpperCase();
        // finally store
        this.componentsMappedByName[classUpperCase] = componentMeta.theClass;
    }

    public createComponentFromElement(element: Element, afterPreCreateCallback?: (comp: Component) => void): Component {
        const key = element.nodeName;
        if (this.componentsMappedByName && this.componentsMappedByName[key]) {
            const newComponent = new this.componentsMappedByName[key]() as Component;
            this.wireBean(newComponent, afterPreCreateCallback);
            return newComponent;
        }
        return null;
    }

    public wireBean(bean: any, afterPreCreateCallback?: (comp: Component) => void): void {
        if (!bean) {
            throw Error(`Can't wire to bean since it is null`);
        }
        this.wireBeans([bean], afterPreCreateCallback);
    }

    private wireBeans(beanInstances: any[], afterPreCreateCallback?: (comp: Component) => void): void {
        this.autoWireBeans(beanInstances);
        this.methodWireBeans(beanInstances);

        this.callLifeCycleMethods(beanInstances, 'preConstructMethods');

        // the callback sets the attributes, so the component has access to attributes
        // before postConstruct methods in the component are executed
        if (_.exists(afterPreCreateCallback)) {
            beanInstances.forEach(afterPreCreateCallback);
        }

        this.callLifeCycleMethods(beanInstances, 'postConstructMethods');
    }

    private createBeans(): void {
        // register all normal beans
        this.contextParams.beans.forEach(this.createBeanWrapper.bind(this));
        // register override beans, these will overwrite beans above of same name
        if (this.contextParams.overrideBeans) {
            this.contextParams.overrideBeans.forEach(this.createBeanWrapper.bind(this));
        }

        // instantiate all beans - overridden beans will be left out
        _.iterateObject(this.beanWrappers, (key: string, beanEntry: BeanWrapper) => {
            let constructorParamsMeta: any;
            if (beanEntry.bean.__agBeanMetaData && beanEntry.bean.__agBeanMetaData.autowireMethods && beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor) {
                constructorParamsMeta = beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor;
            }
            const constructorParams = this.getBeansForParameters(constructorParamsMeta, beanEntry.bean.name);
            const newInstance = applyToConstructor(beanEntry.bean, constructorParams);
            beanEntry.beanInstance = newInstance;

            this.logger.log("bean " + this.getBeanName(newInstance) + " created");
        });
    }

    // tslint:disable-next-line
    private createBeanWrapper(Bean: new () => Object): void {
        const metaData = (Bean as any).__agBeanMetaData;

        if (!metaData) {
            let beanName: string;
            if (Bean.prototype.constructor) {
                beanName = Bean.prototype.constructor.name;
            } else {
                beanName = "" + Bean;
            }
            console.error("context item " + beanName + " is not a bean");
            return;
        }

        const beanEntry = {
            bean: Bean,
            beanInstance: null as any,
            beanName: metaData.beanName
        };

        this.beanWrappers[metaData.beanName] = beanEntry;
    }

    private autoWireBeans(beanInstances: any[]): void {
        beanInstances.forEach(beanInstance => {
            this.forEachMetaDataInHierarchy(beanInstance, (metaData: any, beanName: string) => {
                const attributes = metaData.agClassAttributes;
                if (!attributes) {
                    return;
                }

                attributes.forEach((attribute: any) => {
                    const otherBean = this.lookupBeanInstance(beanName, attribute.beanName, attribute.optional);
                    beanInstance[attribute.attributeName] = otherBean;
                });
            });
        });
    }

    private methodWireBeans(beanInstances: any[]): void {
        beanInstances.forEach(beanInstance => {
            this.forEachMetaDataInHierarchy(beanInstance, (metaData: any, beanName: string) => {
                _.iterateObject(metaData.autowireMethods, (methodName: string, wireParams: any[]) => {
                    // skip constructor, as this is dealt with elsewhere
                    if (methodName === "agConstructor") {
                        return;
                    }
                    const initParams = this.getBeansForParameters(wireParams, beanName);
                    beanInstance[methodName].apply(beanInstance, initParams);
                });
            });
        });
    }

    private forEachMetaDataInHierarchy(beanInstance: any, callback: (metaData: any, beanName: string) => void): void {

        let prototype: any = Object.getPrototypeOf(beanInstance);
        while (prototype != null) {

            const constructor: any = prototype.constructor;

            if (constructor.hasOwnProperty('__agBeanMetaData')) {
                const metaData = constructor.__agBeanMetaData;
                const beanName = this.getBeanName(constructor);
                callback(metaData, beanName);
            }

            prototype = Object.getPrototypeOf(prototype);
        }
    }

    private getBeanName(constructor: any): string {
        if (constructor.__agBeanMetaData && constructor.__agBeanMetaData.beanName) {
            return constructor.__agBeanMetaData.beanName;
        }

        const constructorString = constructor.toString();
        const beanName = constructorString.substring(9, constructorString.indexOf("("));
        return beanName;
    }

    private getBeansForParameters(parameters: any, beanName: string): any[] {
        const beansList: any[] = [];
        if (parameters) {
            _.iterateObject(parameters, (paramIndex: string, otherBeanName: string) => {
                const otherBean = this.lookupBeanInstance(beanName, otherBeanName);
                beansList[Number(paramIndex)] = otherBean;
            });
        }
        return beansList;
    }

    private lookupBeanInstance(wiringBean: string, beanName: string, optional = false): any {
        if (beanName === "context") {
            return this;
        } else if (this.contextParams.seed && this.contextParams.seed.hasOwnProperty(beanName)) {
            return this.contextParams.seed[beanName];
        } else {
            const beanEntry = this.beanWrappers[beanName];
            if (beanEntry) {
                return beanEntry.beanInstance;
            }
            if (!optional) {
                console.error("ag-Grid: unable to find bean reference " + beanName + " while initialising " + wiringBean);
            }
            return null;
        }
    }

    private callLifeCycleMethods(beanInstances: any[], lifeCycleMethod: string): void {
        beanInstances.forEach((beanInstance: any) => {
            this.forEachMetaDataInHierarchy(beanInstance, (metaData: any) => {
                const methods = metaData[lifeCycleMethod] as string[];
                if (!methods) { return; }
                methods.forEach(methodName => beanInstance[methodName]());
            });
        });
    }

    public getBean(name: string): any {
        return this.lookupBeanInstance("getBean", name, true);
    }

    public getEnterpriseDefaultComponents() : any[] {
        return this.contextParams.enterpriseDefaultComponents;
    }

    public destroy(): void {
        // should only be able to destroy once
        if (this.destroyed) {
            return;
        }
        this.logger.log(">> Shutting down ag-Application Context");

        const beanInstances = this.getBeanInstances();
        this.callLifeCycleMethods(beanInstances, 'preDestroyMethods');

        this.contextParams.seed = null;

        this.destroyed = true;
        this.logger.log(">> ag-Application Context shut down - component is dead");
    }

    public isModuleRegistered(moduleName: ModuleNames): boolean {
        return this.registeredModules.indexOf(moduleName) !== -1;
    }
}

// taken from: http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
// allows calling 'apply' on a constructor
function applyToConstructor(constructor: Function, argArray: any[]) {
    const args = [null].concat(argArray);
    const factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}

export function PreConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    const props = getOrCreateProps(target.constructor);
    if (!props.postConstructMethods) {
        props.preConstructMethods = [];
    }
    props.preConstructMethods.push(methodName);
}

export function PostConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    const props = getOrCreateProps(target.constructor);
    if (!props.postConstructMethods) {
        props.postConstructMethods = [];
    }
    props.postConstructMethods.push(methodName);
}

export function PreDestroy(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    const props = getOrCreateProps(target.constructor);
    if (!props.preDestroyMethods) {
        props.preDestroyMethods = [];
    }
    props.preDestroyMethods.push(methodName);
}

export function Bean(beanName: string): Function {
    return (classConstructor: any) => {
        const props = getOrCreateProps(classConstructor);
        props.beanName = beanName;
    };
}

export function Autowired(name?: string): Function {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        autowiredFunc(target, name, false, target, propertyKey, null);
    };
}

export function Optional(name?: string): Function {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        autowiredFunc(target, name, true, target, propertyKey, null);
    };
}

function autowiredFunc(target: any, name: string, optional: boolean, classPrototype: any, methodOrAttributeName: string, index: number) {
    if (name === null) {
        console.error("ag-Grid: Autowired name should not be null");
        return;
    }
    if (typeof index === "number") {
        console.error("ag-Grid: Autowired should be on an attribute");
        return;
    }

    // it's an attribute on the class
    const props = getOrCreateProps(target.constructor);
    if (!props.agClassAttributes) {
        props.agClassAttributes = [];
    }
    props.agClassAttributes.push({
        attributeName: methodOrAttributeName,
        beanName: name,
        optional: optional
    });
}

export function Qualifier(name: string): Function {
    return (classPrototype: any, methodOrAttributeName: string, index: number) => {
        const constructor: any = typeof classPrototype == "function" ? classPrototype : classPrototype.constructor;
        let props: any;

        if (typeof index === "number") {
            // it's a parameter on a method
            let methodName: string;
            if (methodOrAttributeName) {
                props = getOrCreateProps(constructor);
                methodName = methodOrAttributeName;
            } else {
                props = getOrCreateProps(constructor);
                methodName = "agConstructor";
            }
            if (!props.autowireMethods) {
                props.autowireMethods = {};
            }
            if (!props.autowireMethods[methodName]) {
                props.autowireMethods[methodName] = {};
            }
            props.autowireMethods[methodName][index] = name;
        }
    };
}

function getOrCreateProps(target: any): any {
    if (!target.hasOwnProperty("__agBeanMetaData")) {
        target.__agBeanMetaData = {};
    }

    return target.__agBeanMetaData;
}
