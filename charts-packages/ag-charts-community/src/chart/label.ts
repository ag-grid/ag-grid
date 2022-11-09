import { BOOLEAN, NUMBER, OPT_FONT_STYLE, OPT_FONT_WEIGHT, COLOR_STRING, STRING, Validate } from '../util/validation';
import { getFont } from '../scene/shape/text';
import { FontStyle, FontWeight } from './agChartOptions';

export class Label {
    @Validate(BOOLEAN)
    enabled = true;

    @Validate(NUMBER(0))
    fontSize = 12;

    @Validate(STRING)
    fontFamily = 'Verdana, sans-serif';

    @Validate(OPT_FONT_STYLE)
    fontStyle?: FontStyle = undefined;

    @Validate(OPT_FONT_WEIGHT)
    fontWeight?: FontWeight = undefined;

    @Validate(COLOR_STRING)
    color = 'rgba(70, 70, 70, 1)';

    getFont(): string {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}
