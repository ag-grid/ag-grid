import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgEventType } from '../eventTypes';
import type { AgEvent } from '../events';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { _warnOnce } from '../utils/function';
import type { GridApi } from './gridApi';
import { gridApiFunctionNames, gridApiFunctionsMap } from './gridApiFunctionNames';
import type { ApiFunction, ApiFunctionName } from './iApiFunction';

const dispatchEvent = (beans: BeanCollection, event: AgEvent<AgEventType>): void =>
    beans.eventService.dispatchEvent(event);

const destroyed = {
    isDestroyed: () => true,
    destroy() {},
    preConstruct() {},
    postConstruct() {},
    preWireBeans() {},
    wireBeans() {},
};

export class ApiFunctionService extends BeanStub implements NamedBean {
    beanName = 'apiFunctionService' as const;

    public readonly gridApi: GridApi;

    private functions: {
        [key in ApiFunctionName]?: (beans: BeanCollection, ...args: any[]) => any;
    } = {
        ...destroyed,
        // this is used by frameworks, also used by aligned grids to identify a grid api instance
        dispatchEvent,
    };

    private beans: BeanCollection | null = null;

    private preDestroyLink: string = '';

    public constructor() {
        super();

        const gridApi = {} as GridApi;
        this.gridApi = gridApi;
        for (const apiName of gridApiFunctionNames) {
            gridApi[apiName] = this.makeApi(apiName)[apiName];
        }
    }

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
    }

    public postConstruct(): void {
        this.preDestroyLink = this.frameworkOverrides.getDocLink('grid-lifecycle/#grid-pre-destroyed');
    }

    public addFunction<TFunctionName extends ApiFunctionName>(
        functionName: TFunctionName,
        func: ApiFunction<TFunctionName>
    ): void {
        if (this.functions !== destroyed) {
            this.functions[functionName] =
                this.beans?.validationService?.validateApiFunction(functionName, func) ?? func;
        }
    }

    private makeApi(apiName: ApiFunctionName) {
        // We return an object here to be sure the function name is properly applied,
        // in this way error stack trace are correct and gridApi.xxx.name === 'xxx'
        // This is generally faster than using Object.defineProperty(gridApi, apiName, { value: apiName, configurable: true });
        // Keep this function as light and simple as possible.
        return {
            [apiName]: (...args: any[]) => {
                const {
                    beans,
                    functions: { [apiName]: fn },
                } = this;
                return fn ? fn(beans!, ...args) : this.apiNotFound(apiName);
            },
        };
    }

    private apiNotFound(fnName: ApiFunctionName): void {
        if (this.functions === destroyed) {
            _warnOnce(
                `Grid API function ${fnName}() cannot be called as the grid has been destroyed.\n` +
                    `Either clear local references to the grid api, when it is destroyed, or check gridApi.isDestroyed() to avoid calling methods against a destroyed grid.\n` +
                    `To run logic when the grid is about to be destroyed use the gridPreDestroy event. See: ${this.preDestroyLink}`
            );
        } else {
            const module = gridApiFunctionsMap[fnName];
            if (typeof module === 'string' && ModuleRegistry.__assertRegistered(module, `api.${fnName}`, this.gridId)) {
                _warnOnce(`API function '${fnName}' not registered to module '${module}'`);
            }
        }
    }

    public override destroy(): void {
        super.destroy();
        this.functions = destroyed;
        this.beans = null;
    }
}
