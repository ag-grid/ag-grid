import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AllEvents } from '../events';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { _warnOnce } from '../utils/function';
import type { GridApi } from './gridApi';
import { gridApiFunctionsMap } from './gridApiFunctions';
import type { ApiFunction, ApiFunctionName } from './iApiFunction';

const defaultFns = {
    isDestroyed: () => true,
    destroy() {},
    preConstruct() {},
    postConstruct() {},
    preWireBeans() {},
    wireBeans() {},
};

const dispatchEvent = (beans: BeanCollection, event: AllEvents): void => beans.eventService.dispatchEvent(event);

// We use a class for AGGridApi so in stack traces calling grid.api.xxx() if an error is thrown it will print "GridApi.xxx"
class GridApiClass {}
Reflect.defineProperty(GridApiClass, 'name', { value: 'GridApi' });

export class ApiFunctionService extends BeanStub implements NamedBean {
    beanName = 'apiFunctionService' as const;

    public readonly api: GridApi = new GridApiClass() as GridApi;

    private fns: {
        [key in ApiFunctionName]?: (beans: BeanCollection, ...args: any[]) => any;
    } = {
        ...defaultFns,

        // dispatchEvent is used by frameworks, also used by aligned grids to identify a grid api instance
        dispatchEvent,
    };

    private beans: BeanCollection | null = null;

    private preDestroyLink: string = '';

    public constructor() {
        super();

        const { api } = this;
        for (const key in gridApiFunctionsMap) {
            api[key as ApiFunctionName] = this.makeApi(key as ApiFunctionName)[key];
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
        const { fns, beans } = this;
        if (fns !== defaultFns) {
            fns[functionName] = beans?.validationService?.validateApiFunction(functionName, func) ?? func;
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
                    fns: { [apiName]: fn },
                } = this;
                return fn ? fn(beans!, ...args) : this.apiNotFound(apiName);
            },
        };
    }

    private apiNotFound(fnName: ApiFunctionName): void {
        const { beans, gridId, preDestroyLink } = this;
        if (!beans) {
            _warnOnce(
                `Grid API function ${fnName}() cannot be called as the grid has been destroyed.\n` +
                    `Either clear local references to the grid api, when it is destroyed, or check gridApi.isDestroyed() to avoid calling methods against a destroyed grid.\n` +
                    `To run logic when the grid is about to be destroyed use the gridPreDestroy event. See: ${preDestroyLink}`
            );
        } else {
            const module = gridApiFunctionsMap[fnName];
            if (ModuleRegistry.__assertRegistered(module, `api.${fnName}`, gridId)) {
                _warnOnce(`API function '${fnName}' not registered to module '${module}'`);
            }
        }
    }

    public override destroy(): void {
        super.destroy();
        this.fns = defaultFns;
        this.beans = null;
    }
}
