import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgEventType } from '../eventTypes';
import type { AgEvent } from '../events';
import { _warnOnce } from '../utils/function';
import type { GridApi } from './gridApi';
import { gridApiFunctionNames } from './gridApiFunctionNames';
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

    private beans: BeanCollection;
    public readonly gridApi: GridApi;

    private functions: {
        [key in ApiFunctionName]?: (beans: BeanCollection, ...args: any[]) => any;
    } = {
        ...destroyed,
        // this is used by frameworks, also used by aligned grids to identify a grid api instance
        dispatchEvent,
    };

    private preDestroyLink: string;

    public constructor() {
        super();

        const gridApi: Partial<GridApi> = {};
        this.gridApi = gridApi as GridApi;
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
            func = this.beans.validationService?.validateApiFunction(functionName, func) ?? func;
            this.functions[functionName] = func;
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
                    functions: { [apiName]: fn },
                    beans,
                } = this;
                return fn ? fn(beans, ...args) : this.apiNotFound(apiName);
            },
        };
    }

    private apiNotFound(fnName: string) {
        if (this.functions === destroyed) {
            _warnOnce(
                `Grid API function ${fnName}() cannot be called as the grid has been destroyed.\n` +
                    `Either clear local references to the grid api, when it is destroyed, or check gridApi.isDestroyed() to avoid calling methods against a destroyed grid.\n` +
                    `To run logic when the grid is about to be destroyed use the gridPreDestroy event. See: ${this.preDestroyLink}`
            );
        }
        this.beans.validationService?.warnMissingApiFunction(fnName);
        return undefined;
    }

    public override destroy(): void {
        super.destroy();
        this.functions = destroyed;
    }
}
