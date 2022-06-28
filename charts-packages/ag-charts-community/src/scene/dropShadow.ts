import { ChangeDetectable, SceneChangeDetection, RedrawType } from './changeDetectable';

export class DropShadow extends ChangeDetectable {
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    enabled = true;
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    color = 'rgba(0, 0, 0, 0.5)';
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    xOffset = 0;
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    yOffset = 0;
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    blur = 5;
}
