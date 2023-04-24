import { ILogger } from "../iLogger";
import { Component } from "../widgets/component";
import { exists, values } from "../utils/generic";
import { iterateObject } from "../utils/object";
import { getFunctionName } from "../utils/function";

// steps in booting up:
// 1. create all beans
// 2. autowire all attributes
// 3. wire all beans
// 4. initialise the model
// 5. initialise the view
// 6. boot??? (not sure if this is needed)
// each bean is responsible for initialising itself, taking items from the gridOptionsService

export interface ContextParams {
    providedBeanInstances: any;
    beanClasses: any[];
    debug: boolean;
}

export interface ComponentMeta {
    componentClass: new () => Object;
    componentName: string;
}

export interface ControllerMeta {
    controllerClass: new () => Object;
    controllerName: string;
}

interface BeanWrapper {
    bean: any;
    beanInstance: any;
    beanName: any;
}

export class Context {

    private beanWrappers: { [key: string]: BeanWrapper; } = {};
    private contextParams: ContextParams;
    private logger: ILogger;

    private destroyed = false;

    public constructor(params: ContextParams, logger: ILogger) {
        if (!params || !params.beanClasses) {
            return;
        }

        this.contextParams = params;

        this.logger = logger;
        this.logger.log(">> creating ag-Application Context");

        this.createBeans();

        const beanInstances = this.getBeanInstances();

        this.wireBeans(beanInstances);

        this.logger.log(">> ag-Application Context ready - component is alive");
    }

    private getBeanInstances(): any[] {
        return values(this.beanWrappers).map(beanEntry => beanEntry.beanInstance);
    }

    public createBean<T extends any>(bean: T, afterPreCreateCallback?: (comp: Component) => void): T {
        if (!bean) {
            throw Error(`Can't wire to bean since it is null`);
        }
        this.wireBeans([bean], afterPreCreateCallback);
        return bean;
    }

    private wireBeans(beanInstances: any[], afterPreCreateCallback?: (comp: Component) => void): void {
        this.autoWireBeans(beanInstances);
        this.methodWireBeans(beanInstances);

        this.callLifeCycleMethods(beanInstances, 'preConstructMethods');

        // the callback sets the attributes, so the component has access to attributes
        // before postConstruct methods in the component are executed
        if (exists(afterPreCreateCallback)) {
            beanInstances.forEach(afterPreCreateCallback);
        }

        this.callLifeCycleMethods(beanInstances, 'postConstructMethods');
    }

    private createBeans(): void {
        // register all normal beans
        this.contextParams.beanClasses.forEach(this.createBeanWrapper.bind(this));
        // register override beans, these will overwrite beans above of same name

        // instantiate all beans - overridden beans will be left out
        iterateObject(this.beanWrappers, (key: string, beanEntry: BeanWrapper) => {
            let constructorParamsMeta: any;
            if (beanEntry.bean.__agBeanMetaData && beanEntry.bean.__agBeanMetaData.autowireMethods && beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor) {
                constructorParamsMeta = beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor;
            }
            const constructorParams = this.getBeansForParameters(constructorParamsMeta, beanEntry.bean.name);
            const newInstance = new (beanEntry.bean.bind.apply(beanEntry.bean, [null, ...constructorParams]));
            beanEntry.beanInstance = newInstance;
        });

        const createdBeanNames = Object.keys(this.beanWrappers).join(', ');
        this.logger.log(`created beans: ${createdBeanNames}`);
    }

    // tslint:disable-next-line
    private createBeanWrapper(BeanClass: new () => Object): void {
        const metaData = (BeanClass as any).__agBeanMetaData;

        if (!metaData) {
            let beanName: string;
            if (BeanClass.prototype.constructor) {
                beanName = getFunctionName(BeanClass.prototype.constructor);
            } else {
                beanName = "" + BeanClass;
            }
            console.error(`Context item ${beanName} is not a bean`);
            return;
        }

        const beanEntry = {
            bean: BeanClass,
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
                iterateObject(metaData.autowireMethods, (methodName: string, wireParams: any[]) => {
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
            iterateObject(parameters, (paramIndex: string, otherBeanName: string) => {
                const otherBean = this.lookupBeanInstance(beanName, otherBeanName);
                beansList[Number(paramIndex)] = otherBean;
            });
        }
        return beansList;
    }

    private lookupBeanInstance(wiringBean: string, beanName: string, optional = false): any {
        if (beanName === "context") {
            return this;
        }

        if (this.contextParams.providedBeanInstances && this.contextParams.providedBeanInstances.hasOwnProperty(beanName)) {
            return this.contextParams.providedBeanInstances[beanName];
        }

        const beanEntry = this.beanWrappers[beanName];

        if (beanEntry) {
            return beanEntry.beanInstance;
        }

        if (!optional) {
            console.error(`AG Grid: unable to find bean reference ${beanName} while initialising ${wiringBean}`);
        }

        return null;
    }

    private callLifeCycleMethods(beanInstances: any[], lifeCycleMethod: string): void {
        beanInstances.forEach(beanInstance => this.callLifeCycleMethodsOnBean(beanInstance, lifeCycleMethod));
    }

    private callLifeCycleMethodsOnBean(beanInstance: any, lifeCycleMethod: string, methodToIgnore?: string): void {
        // putting all methods into a map removes duplicates
        const allMethods: { [methodName: string]: boolean; } = {};

        // dump methods from each level of the metadata hierarchy
        this.forEachMetaDataInHierarchy(beanInstance, (metaData: any) => {
            const methods = metaData[lifeCycleMethod] as string[];
            if (methods) {
                methods.forEach(methodName => {
                    if (methodName != methodToIgnore) {
                        allMethods[methodName] = true;
                    }
                });
            }
        });

        const allMethodsList = Object.keys(allMethods);
        allMethodsList.forEach(methodName => beanInstance[methodName]());
    }

    public getBean(name: string): any {
        return this.lookupBeanInstance("getBean", name, true);
    }

    public destroy(): void {
        if (this.destroyed) { return; }

        this.logger.log(">> Shutting down ag-Application Context");

        const beanInstances = this.getBeanInstances();
        this.destroyBeans(beanInstances);

        this.contextParams.providedBeanInstances = null;
        this.destroyed = true;

        this.logger.log(">> ag-Application Context shut down - component is dead");
    }

    public destroyBean<T>(bean: T): undefined {
        if (!bean) { return; }

        this.destroyBeans([bean]);
    }

    public destroyBeans<T>(beans: T[]): T[] {
        if (!beans) { return []; }

        beans.forEach(bean => {
            this.callLifeCycleMethodsOnBean(bean, 'preDestroyMethods', 'destroy');

            // call destroy() explicitly if it exists
            const beanAny = bean as any;

            if (typeof beanAny.destroy === 'function') {
                beanAny.destroy();
            }
        });

        return [];
    }
}

export function PreConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    const props = getOrCreateProps(target.constructor);
    if (!props.preConstructMethods) {
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

function autowiredFunc(target: any, name: string | undefined, optional: boolean, classPrototype: any, methodOrAttributeName: string, index: number | null) {
    if (name === null) {
        console.error("AG Grid: Autowired name should not be null");
        return;
    }
    if (typeof index === "number") {
        console.error("AG Grid: Autowired should be on an attribute");
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
