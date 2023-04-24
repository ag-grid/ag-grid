import { BOOLEAN, COLOR_STRING, NUMBER, Validate } from '../util/validation';
import { ChangeDetectable, RedrawType } from './changeDetectable';
import { SceneChangeDetection } from './node';

export class DropShadow extends ChangeDetectable {
    @Validate(BOOLEAN)
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    enabled = true;

    @Validate(COLOR_STRING)
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    color = 'rgba(0, 0, 0, 0.5)';

    @Validate(NUMBER())
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    xOffset = 0;

    @Validate(NUMBER())
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    yOffset = 0;

    @Validate(NUMBER(0))
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    blur = 5;
}
