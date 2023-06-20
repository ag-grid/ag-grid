import { Axis } from '../../axis';
import { Scale } from '../../scale/scale';
import { Validate, NUMBER } from '../../util/validation';
import { TickInterval } from './axisTick';

export abstract class CartesianAxis<
    S extends Scale<D, number, TickInterval<S>> = Scale<any, number, any>,
    D = any
> extends Axis<S, D> {
    @Validate(NUMBER(0))
    thickness: number = 0;
}
