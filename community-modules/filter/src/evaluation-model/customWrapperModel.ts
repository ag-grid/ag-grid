import { FilterExpression, FilterEvaluationModel, PartialStateType } from "@ag-grid-community/core";

type ProxyMethod = keyof FilterEvaluationModel<unknown>;
const REQUIRED_METHODS: ProxyMethod[] = ['evaluate'];

/** Wrapper type to simplify the implementation requirements for custom evaluation models. */
export class CustomWrapperModel<T> implements FilterEvaluationModel<T> {
    public constructor(
        private readonly customModel: Partial<FilterEvaluationModel<T>>,
        private readonly expr: FilterExpression | PartialStateType<FilterExpression>,
    ) {
        REQUIRED_METHODS.forEach((method) => {
            if (typeof customModel[method] !== 'function') {
                throw new Error('AG Grid - Custom FilterEvaluationModel must implement ' + method);
            }
        });
    }

    public evaluate(input: T): boolean {
        return this.proxy('evaluate', false, input);
    }

    public isValid(): boolean {
        return this.proxy('isValid', true);
    }

    public isNull(): boolean {
        return this.proxy('isNull', false);
    }

    public toFilterExpression(): FilterExpression {
        return this.proxy('toFilterExpression', this.expr as FilterExpression);
    }

    private proxy<M extends ProxyMethod, R extends ReturnType<FilterEvaluationModel<T>[M]>>(
        method: M,
        defaultReturn: R,
        ...args: Parameters<FilterEvaluationModel<T>[M]>
    ): R {
        const fn = this.customModel[method] as Function | undefined;
        if (typeof fn === 'function') {
            return fn.bind(this.customModel)(...args) as R;
        }

        return defaultReturn;
    }
}
