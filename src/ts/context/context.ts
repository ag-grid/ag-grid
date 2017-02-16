import {Utils as _} from "../utils";
import {ILogger} from "../iLogger";
import {Component} from "../widgets/component";

// steps in booting up:
// 1. create all beans
// 2. autowire all attributes
// 3. wire all beans
// 4. initialise the model
// 5. initialise the view
// 6. boot??? (not sure if this is needed)
// each bean is responsible for initialising itself, taking items from the gridOptionsWrapper

export interface ContextParams {
    seed: any,
    beans: any[],
    components: ComponentMeta[],
    overrideBeans: any[],
    debug: boolean
}

export interface ComponentMeta {
    theClass: new()=>Object,
    componentName: string
}

interface BeanEntry {
    bean: any,
    beanInstance: any,
    beanName: any
}

export class Context {

    private beans: {[key: string]: BeanEntry} = {};
    private contextParams: ContextParams;
    private logger: ILogger;

    private componentsMappedByName: {[key: string]: any} = {};

    private destroyed = false;
    
    public constructor(params: ContextParams, logger: ILogger) {

        if (!params || !params.beans) {
            return;
        }

        this.contextParams = params;

        this.logger = logger;
        this.logger.log('>> creating ag-Application Context');

        this.setupComponents();

        this.createBeans();

        var beans = _.mapObject(this.beans, (beanEntry: BeanEntry) => beanEntry.beanInstance);

        this.wireBeans(beans);

        this.logger.log('>> ag-Application Context ready - component is alive');
    }

    private setupComponents(): void {
        if (this.contextParams.components) {
            this.contextParams.components.forEach( componentMeta => this.addComponent(componentMeta) )
        }
    }

    private addComponent(componentMeta: ComponentMeta): void {
        // get name of the class as a string
        // var className = _.getNameOfClass(ComponentClass);
        // insert a dash after every capital letter
        // var classEscaped = className.replace(/([A-Z])/g, "-$1").toLowerCase();
        var classEscaped = componentMeta.componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        // put all to upper case
        var classUpperCase = classEscaped.toUpperCase();
        // finally store
        this.componentsMappedByName[classUpperCase] = componentMeta.theClass;
    }

    public createComponent(element: Element): Component {
        var key = element.nodeName;
        if (this.componentsMappedByName && this.componentsMappedByName[key]) {
            var newComponent = <Component> new this.componentsMappedByName[key];
            this.wireBean(newComponent);
            this.copyAttributesFromNode(element, newComponent.getGui());
            newComponent.attributesSet();
            return newComponent;
        } else {
            return null;
        }
    }

    private copyAttributesFromNode(fromNode: Element, toNode: Element): void {
        if (fromNode.attributes) {
            var count = fromNode.attributes.length;
            for (var i = 0; i<count; i++) {
                var attr = fromNode.attributes[i];
                toNode.setAttribute(attr.name, attr.value);
            }
        }
    }

    public wireBean(bean: any): void {
        this.wireBeans([bean]);
    }

    private wireBeans(beans: any[]): void {
        this.autoWireBeans(beans);
        this.methodWireBeans(beans);
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
            var constructorParamsMeta: any;
            if (beanEntry.bean.prototype.__agBeanMetaData
                && beanEntry.bean.prototype.__agBeanMetaData.autowireMethods
                && beanEntry.bean.prototype.__agBeanMetaData.autowireMethods.agConstructor) {
                constructorParamsMeta = beanEntry.bean.prototype.__agBeanMetaData.autowireMethods.agConstructor;
            }
            var constructorParams = this.getBeansForParameters(constructorParamsMeta, beanEntry.beanName);
            var newInstance = applyToConstructor(beanEntry.bean, constructorParams);
            beanEntry.beanInstance = newInstance;

            this.logger.log('bean ' + this.getBeanName(newInstance) + ' created');
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
            beanName: metaData.beanName
        };

        this.beans[metaData.beanName] = beanEntry;
    }

    private autoWireBeans(beans: any[]): void {
        beans.forEach( bean => this.autoWireBean(bean) );
    }

    private methodWireBeans(beans: any[]): void {
        beans.forEach( bean => this.methodWireBean(bean) );
    }

    private autoWireBean(bean: any): void {
        if (!bean
            || !bean.__agBeanMetaData
            || !bean.__agBeanMetaData.agClassAttributes) {
            return;
        }
        var attributes = bean.__agBeanMetaData.agClassAttributes;
        if (!attributes) {
            return;
        }

        var beanName = this.getBeanName(bean);

        attributes.forEach( (attribute: any)=> {
            var otherBean = this.lookupBeanInstance(beanName, attribute.beanName, attribute.optional);
            bean[attribute.attributeName] = otherBean;
        });
    }

    private getBeanName(bean: any): string {
        var constructorString = bean.constructor.toString();
        var beanName = constructorString.substring(9, constructorString.indexOf('('));
        return beanName;
    }

    private methodWireBean(bean: any): void {

        var autowiredMethods: any;
        if (bean.__agBeanMetaData) {
            autowiredMethods = bean.__agBeanMetaData.autowireMethods;
        }

        _.iterateObject(autowiredMethods, (methodName: string, wireParams: any[]) => {
            // skip constructor, as this is dealt with elsewhere
            if (methodName === 'agConstructor') { return; }
            var beanName = this.getBeanName(bean);
            var initParams = this.getBeansForParameters(wireParams, beanName);
            bean[methodName].apply(bean, initParams);
        });
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

    private lookupBeanInstance(wiringBean: string, beanName: string, optional = false): any {
        if (beanName === 'context') {
            return this;
        } else if (this.contextParams.seed && this.contextParams.seed.hasOwnProperty(beanName)) {
            return this.contextParams.seed[beanName];
        } else {
            var beanEntry = this.beans[beanName];
            if (beanEntry) {
                return beanEntry.beanInstance;
            }
            if (!optional) {
                console.error('ag-Grid: unable to find bean reference ' + beanName + ' while initialising ' + wiringBean);
            }
            return null;
        }
    }

    private postConstruct(beans: any): void {
        beans.forEach( (bean: any) => {
            // try calling init methods
            if (bean.__agBeanMetaData && bean.__agBeanMetaData.postConstructMethods) {
                bean.__agBeanMetaData.postConstructMethods.forEach( (methodName: string) => bean[methodName]() );
            }

        } );
    }

    public getBean(name: string): any {
        return this.lookupBeanInstance('getBean', name, true);
    }

    public destroy(): void {
        // should only be able to destroy once
        if (this.destroyed) {
            return;
        }
        this.logger.log('>> Shutting down ag-Application Context');
        
        // try calling destroy methods
        _.iterateObject(this.beans, (key: string, beanEntry: BeanEntry) => {
            var bean = beanEntry.beanInstance;
            if (bean.__agBeanMetaData && bean.__agBeanMetaData.preDestroyMethods) {
                bean.__agBeanMetaData.preDestroyMethods.forEach( (methodName: string) => bean[methodName]() );
            }
        });

        this.destroyed = true;
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

export function PostConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    var props = getOrCreateProps(target);
    if (!props.postConstructMethods) {
        props.postConstructMethods = [];
    }
    props.postConstructMethods.push(methodName);
}

export function PreDestroy(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    var props = getOrCreateProps(target);
    if (!props.preDestroyMethods) {
        props.preDestroyMethods = [];
    }
    props.preDestroyMethods.push(methodName);
}

export function Bean(beanName: string): Function {
    return (classConstructor: any) => {
        var props = getOrCreateProps(classConstructor.prototype);
        props.beanName = beanName;
    };
}

export function Autowired(name?: string): Function {
    return autowiredFunc.bind(this, name, false);
}

export function Optional(name?: string): Function {
    return autowiredFunc.bind(this, name, true);
}

function autowiredFunc(name: string, optional: boolean, classPrototype: any, methodOrAttributeName: string, index: number) {

    if (name===null) {
        console.error('ag-Grid: Autowired name should not be null');
        return;
    }
    if (typeof index === 'number') {
        console.error('ag-Grid: Autowired should be on an attribute');
        return;
    }

    // it's an attribute on the class
    var props = getOrCreateProps(classPrototype);
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

    var props = target.__agBeanMetaData;

    if (!props) {
        props = {};
        target.__agBeanMetaData = props;
    }

    return props;
}