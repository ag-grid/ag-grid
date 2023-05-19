import { STRING_UNION, Validate } from '../util/validation';

export class ChartHighlight {
    @Validate(STRING_UNION('tooltip', 'node'))
    public range: 'tooltip' | 'node' = 'tooltip';
}
