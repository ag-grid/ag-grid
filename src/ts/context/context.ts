import { Utils as _ } from "../utils";
import { ILogger } from "../iLogger";
import { Component } from "../widgets/component";
import {IComponent} from "../interfaces/iComponent";

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
    overrideBeans: any[];
    debug: boolean;
}

export interface ComponentMeta {
    theClass: new () => Object;
    componentName: string;
}

interface BeanEntry {
    bean: any;
    beanInstance: any;
    beanName: any;
}

export class Context {
    private beans: { [key: string]: BeanEntry } = {};
    private contextParams: ContextParams;
    private logger: ILogger;

    private componentsMappedByName: { [key: string]: any } = {};

    private destroyed = false;

    public constructor(params: ContextParams, logger: ILogger) {
        if (!params || !params.beans) {
            return;
        }

        this.contextParams = params;

        this.logger = logger;
        this.logger.log(">> creating ag-Application Context");

        this.setupComponents();

        this.createBeans();

        let beans = _.mapObject(this.beans, (beanEntry: BeanEntry) => beanEntry.beanInstance);

        this.wireBeans(beans);

        this.logger.log(">> ag-Application Context ready - component is alive");
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
        let classEscaped = componentMeta.componentName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
        // put all to upper case
        let classUpperCase = classEscaped.toUpperCase();
        // finally store
        this.componentsMappedByName[classUpperCase] = componentMeta.theClass;
    }

    public createComponent(element: Element, afterPreCreateCallback?: (comp: Component)=>void): Component {
        let key = element.nodeName;
        if (this.componentsMappedByName && this.componentsMappedByName[key]) {
            let newComponent = <Component> new this.componentsMappedByName[key]();
            this.wireBean(newComponent, afterPreCreateCallback);
            return newComponent;
        } else {
            return null;
        }
    }

    public wireBean(bean: any, afterPreCreateCallback?: (comp: Component)=>void): void {
        if (!bean) {
            throw Error(`Can't wire to bean since it is null`);
        }
        this.wireBeans([bean], afterPreCreateCallback);
    }

    private wireBeans(beans: any[], afterPreCreateCallback?: (comp: Component)=>void): void {
        this.autoWireBeans(beans);
        this.methodWireBeans(beans);
        this.preConstruct(beans);
        // the callback sets the attributes, so the component has access to attributes
        // before postConstruct methods in the component are executed
        if (_.exists(afterPreCreateCallback)) {
            beans.forEach(afterPreCreateCallback);
        }
        this.postConstruct(beans);
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
            let constructorParamsMeta: any;
            if (beanEntry.bean.__agBeanMetaData && beanEntry.bean.__agBeanMetaData.autowireMethods && beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor) {
                constructorParamsMeta = beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor;
            }
            let constructorParams = this.getBeansForParameters(constructorParamsMeta, beanEntry.bean.name);
            let newInstance = applyToConstructor(beanEntry.bean, constructorParams);
            beanEntry.beanInstance = newInstance;

            this.logger.log("bean " + this.getBeanName(newInstance) + " created");
        });
    }

    private createBeanEntry(Bean: new () => Object): void {
        let metaData = (<any>Bean).__agBeanMetaData;

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

        let beanEntry = {
            bean: Bean,
            beanInstance: <any>null,
            beanName: metaData.beanName
        };

        this.beans[metaData.beanName] = beanEntry;
    }

    private autoWireBeans(beans: any[]): void {
        beans.forEach(bean => this.autoWireBean(bean));
    }

    private methodWireBeans(beans: any[]): void {
        beans.forEach(bean => {
            if (!bean) {
                throw Error(`Can't wire to bean since it is null`);
            }
            return this.methodWireBean(bean);
        });
    }

    private autoWireBean(bean: any): void {
        let currentBean: any = bean;
        while (currentBean != null) {
            let currentConstructor: any = currentBean.constructor;

            if (currentConstructor.__agBeanMetaData && currentConstructor.__agBeanMetaData.agClassAttributes) {
                let attributes = currentConstructor.__agBeanMetaData.agClassAttributes;
                if (!attributes) {
                    return;
                }

                let beanName = this.getBeanName(currentConstructor);

                attributes.forEach((attribute: any) => {
                    let otherBean = this.lookupBeanInstance(beanName, attribute.beanName, attribute.optional);
                    bean[attribute.attributeName] = otherBean;
                });
            }
            currentBean = Object.getPrototypeOf(currentBean) ? Object.getPrototypeOf(currentBean) : null;
        }
    }

    private getBeanName(constructor: any): string {
        if (constructor.__agBeanMetaData && constructor.__agBeanMetaData.beanName) {
            return constructor.__agBeanMetaData.beanName;
        }

        let constructorString = constructor.toString();
        let beanName = constructorString.substring(9, constructorString.indexOf("("));
        return beanName;
    }

    private methodWireBean(bean: any): void {
        let autowiredMethods: any;
        if (bean.constructor.__agBeanMetaData && bean.constructor.__agBeanMetaData.autowireMethods) {
            autowiredMethods = bean.constructor.__agBeanMetaData.autowireMethods;
        }

        _.iterateObject(autowiredMethods, (methodName: string, wireParams: any[]) => {
            // skip constructor, as this is dealt with elsewhere
            if (methodName === "agConstructor") {
                return;
            }
            let beanName = this.getBeanName(bean.constructor);
            let initParams = this.getBeansForParameters(wireParams, beanName);
            bean[methodName].apply(bean, initParams);
        });
    }

    private getBeansForParameters(parameters: any, beanName: string): any[] {
        let beansList: any[] = [];
        if (parameters) {
            _.iterateObject(parameters, (paramIndex: string, otherBeanName: string) => {
                let otherBean = this.lookupBeanInstance(beanName, otherBeanName);
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
            let beanEntry = this.beans[beanName];
            if (beanEntry) {
                return beanEntry.beanInstance;
            }
            if (!optional) {
                console.error("ag-Grid: unable to find bean reference " + beanName + " while initialising " + wiringBean);
            }
            return null;
        }
    }

    private postConstruct(beans: any): void {
        beans.forEach((bean: any) => {
            // try calling init methods
            if (bean.constructor.__agBeanMetaData && bean.constructor.__agBeanMetaData.postConstructMethods) {
                bean.constructor.__agBeanMetaData && bean.constructor.__agBeanMetaData.postConstructMethods.forEach((methodName: string) => bean[methodName]());
            }
        });
    }

    private preConstruct(beans: any): void {
        beans.forEach((bean: any) => {
            // try calling init methods
            if (bean.constructor.__agBeanMetaData && bean.constructor.__agBeanMetaData.preConstructMethods) {
                bean.constructor.__agBeanMetaData.preConstructMethods.forEach((methodName: string) => bean[methodName]());
            }
        });
    }

    public getBean(name: string): any {
        return this.lookupBeanInstance("getBean", name, true);
    }

    public destroy(): void {
        // should only be able to destroy once
        if (this.destroyed) {
            return;
        }
        this.logger.log(">> Shutting down ag-Application Context");

        // try calling destroy methods
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            let bean = beanEntry.beanInstance;
            if (bean.constructor.__agBeanMetaData && bean.constructor.__agBeanMetaData.preDestroyMethods) {
                bean.constructor.__agBeanMetaData.preDestroyMethods.forEach((methodName: string) => bean[methodName]());
            }
        });

        this.destroyed = true;
        this.logger.log(">> ag-Application Context shut down - component is dead");
    }
}

// taken from: http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
// allows calling 'apply' on a constructor
function applyToConstructor(constructor: Function, argArray: any[]) {
    let args = [null].concat(argArray);
    let factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}

export function PreConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    let props = getOrCreateProps(target.constructor);
    if (!props.postConstructMethods) {
        props.preConstructMethods = [];
    }
    props.preConstructMethods.push(methodName);
}

export function PostConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    let props = getOrCreateProps(target.constructor);
    if (!props.postConstructMethods) {
        props.postConstructMethods = [];
    }
    props.postConstructMethods.push(methodName);
}

export function PreDestroy(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    let props = getOrCreateProps(target.constructor);
    if (!props.preDestroyMethods) {
        props.preDestroyMethods = [];
    }
    props.preDestroyMethods.push(methodName);
}

export function Bean(beanName: string): Function {
    return (classConstructor: any) => {
        let props = getOrCreateProps(classConstructor);
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
    let props = getOrCreateProps(target.constructor);
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
        let constructor: any = typeof classPrototype == "function" ? classPrototype : classPrototype.constructor;
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