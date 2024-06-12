import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgEventType } from '../eventTypes';
import type { AgEvent } from '../events';
import { _warnOnce } from '../utils/function';
import type { ApiFunction, ApiFunctionName } from './iApiFunction';

function dispatchEvent(beans: BeanCollection, event: AgEvent<AgEventType>): void {
    beans.eventService.dispatchEvent(event);
}

export class ApiFunctionService extends BeanStub implements NamedBean {
    beanName = 'apiFunctionService' as const;

    private beans: BeanCollection;
    private functions: { [key in ApiFunctionName]?: (beans: BeanCollection, ...args: any[]) => any } = {
        // this is used by frameworks
        dispatchEvent,
    };
    private isDestroyed = false;
    private preDestroyLink: string;

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
    }

    public postConstruct(): void {
        this.preDestroyLink = this.frameworkOverrides.getDocLink('grid-lifecycle/#grid-pre-destroyed');
    }

    public callFunction(functionName: ApiFunctionName, args: any[]): any {
        const func = this.functions[functionName];

        if (func) {
            return func.apply(func, [this.beans, ...args]);
        }

        if (this.isDestroyed) {
            return this.destroyedHandler(functionName);
        }
        if (this.isFrameworkMethod(functionName)) {
            return undefined;
        }
        this.beans.validationService?.warnMissingApiFunction(functionName);
        return undefined;
    }

    public addFunction<TFunctionName extends ApiFunctionName>(
        functionName: TFunctionName,
        func: ApiFunction<TFunctionName>
    ): void {
        const { validationService } = this.beans;
        if (validationService) {
            func = validationService.validateApiFunction(functionName, func);
        }
        this.functions[functionName] = func;
    }

    public override destroy(): void {
        this.functions = {};
        this.isDestroyed = true;
        super.destroy();
    }

    private destroyedHandler(functionName: ApiFunctionName): any {
        if (functionName === 'isDestroyed') {
            return true;
        }
        if (functionName === 'destroy') {
            return;
        }
        _warnOnce(
            `Grid API function ${functionName}() cannot be called as the grid has been destroyed.\n` +
                `It is recommended to remove local references to the grid api. Alternatively, check gridApi.isDestroyed() to avoid calling methods against a destroyed grid.\n` +
                `To run logic when the grid is about to be destroyed use the gridPreDestroy event. See: ${this.preDestroyLink}`
        );
        return;
    }

    private isFrameworkMethod(functionName: string): boolean {
        return ['preWireBeans', 'wireBeans', 'preConstruct', 'postConstruct'].includes(functionName);
    }
}
