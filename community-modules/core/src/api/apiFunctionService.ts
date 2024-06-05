import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ApiFunction, ApiFunctionName } from './iApiFunction';

export class ApiFunctionService extends BeanStub implements NamedBean {
    beanName = 'apiFunctionService' as const;

    private beans: BeanCollection;
    private functions: { [key in ApiFunctionName]?: (beans: BeanCollection, ...args: any[]) => any } = {};
    private isDestroyed = false;
    private preDestroyLink: string;

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
    }

    public postConstruct(): void {
        this.preDestroyLink = this.frameworkOverrides.getDocLink('grid-lifecycle/#grid-pre-destroyed');
    }

    public callFunction(functionName: ApiFunctionName, args: any[]): any {
        if (this.isDestroyed) {
            return this.destroyedHandler(functionName);
        }
        const func = this.functions[functionName];

        return func ? func.apply(func, [this.beans, ...args]) : undefined;
    }

    public addFunction<TFunctionName extends ApiFunctionName>(
        functionName: TFunctionName,
        func: ApiFunction<TFunctionName>
    ): void {
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
        console.warn(
            `AG Grid: Grid API function ${functionName}() cannot be called as the grid has been destroyed.\n` +
                `It is recommended to remove local references to the grid api. Alternatively, check gridApi.isDestroyed() to avoid calling methods against a destroyed grid.\n` +
                `To run logic when the grid is about to be destroyed use the gridPreDestroy event. See: ${this.preDestroyLink}`
        );
        return;
    }
}
