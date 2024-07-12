import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgEventType } from '../eventTypes';
import type { AgEvent } from '../events';
import { _warnOnce } from '../utils/function';
import type { GridApi } from './gridApi';
import type { ApiFunction, ApiFunctionName } from './iApiFunction';

const dispatchEvent = (beans: BeanCollection, event: AgEvent<AgEventType>): void => {
    beans.eventService.dispatchEvent(event);
};

export class ApiFunctionService extends BeanStub implements NamedBean {
    beanName = 'apiFunctionService' as const;

    public readonly gridApi: GridApi;
    private beans: BeanCollection | undefined;
    private preDestroyLink: string;
    private functions: Record<string, (beans: BeanCollection, ...args: unknown[]) => unknown> | undefined = {};
    private getGridApiProp: (target: any, prop: string | symbol) => any;

    public constructor() {
        super();

        const apis: Record<string | symbol, any> = {
            // Add here identifiers to be excluded.
            // It includes implicitly all Object.prototype methods (valueOf, toString, hasOwnProperty, etc)
            __proto__: Object.prototype,
            toJSON: undefined,
            then: undefined,
            catch: undefined,
            finally: undefined,

            beanName: undefined,

            preWireBeans() {},
            wireBeans() {},
            preConstruct() {},
            postConstruct() {},
        };

        const getGridApiProp = (_target: never, name: string | symbol): unknown => {
            if (name in apis || typeof name !== 'string') {
                return apis[name];
            }
            return (apis[name] = this.makeApi(name)[name]);
        };

        this.getGridApiProp = getGridApiProp;

        // GridApi is a plain object that extends a Proxy.
        // In this way, GridApi will behave like a normal object,
        // but with the ability to intercept property access for properties not found.
        // This also removes the performance penalty of using a Proxy for registered functions.
        this.gridApi = Object.create(Object.freeze(new Proxy({}, { get: getGridApiProp }))) as any;

        // this is used by frameworks also used by aligned grids to identify a grid api instance
        this.addFunction('dispatchEvent', dispatchEvent);
    }

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
    }

    public postConstruct(): void {
        this.preDestroyLink = this.frameworkOverrides.getDocLink('grid-lifecycle/#grid-pre-destroyed');
    }

    public addFunction<TFunctionName extends ApiFunctionName>(
        name: TFunctionName,
        fn: ApiFunction<TFunctionName>
    ): void {
        const { functions, gridApi } = this;
        if (functions) {
            functions[name] = this.beans?.validationService?.validateApiFunction(name, fn) ?? fn;
        }
        gridApi[name] = this.getGridApiProp(0, name);
    }

    public override destroy(): void {
        this.functions = undefined;
        super.destroy();
        this.beans = undefined;
    }

    private makeApi<TName extends string>(name: TName) {
        // We return an object here so function.toString returns the right function name
        // This is faster and minifies better than calling Object.defineProperty(func, 'name', { value: name, configurable: true })
        // Keep this function light and small for performance reasons.
        return {
            [name]: (...args: unknown[]) => {
                const api = this.functions?.[name as ApiFunctionName];
                return api ? api(this.beans!, ...args) : this.apiWarn(name);
            },
        };
    }

    private apiWarn(functionName: string): unknown {
        if (!this.beans) {
            if (functionName === 'isDestroyed') {
                return true;
            }
            if (functionName === 'destroy') {
                return undefined;
            }
            _warnOnce(
                `Grid API function ${functionName}() cannot be called as the grid has been destroyed.\n` +
                    `Either clear local references to the grid api, when it is destroyed, or check gridApi.isDestroyed() to avoid calling methods against a destroyed grid.\n` +
                    `To run logic when the grid is about to be destroyed use the gridPreDestroy event. See: ${this.preDestroyLink}`
            );
            return undefined;
        }

        return this.beans.validationService?.warnMissingApiFunction(functionName as ApiFunctionName);
    }
}
