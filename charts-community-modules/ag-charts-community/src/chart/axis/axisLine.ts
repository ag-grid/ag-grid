import { Validate, NUMBER, OPT_COLOR_STRING } from '../../util/validation';

export class AxisLine {
    @Validate(NUMBER(0))
    width: number = 1;

    @Validate(OPT_COLOR_STRING)
    color?: string = 'rgba(195, 195, 195, 1)';
}
