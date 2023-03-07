import { Mouse } from '../createMouse';
import { ScriptDebugger } from '../createScriptDebugger';
import { addPoints, Point } from '../geometry';

interface MoveTargetParams {
    target: HTMLElement;
    coords: Point;
    offset?: Point;
    scriptDebugger?: ScriptDebugger;
}

interface MoveMouseParams {
    mouse: Mouse;
    coords: Point;
    offset?: Point;
    scriptDebugger?: ScriptDebugger;
}

export function moveTarget({ target, coords, offset, scriptDebugger }: MoveTargetParams) {
    const x = coords.x + (offset?.x ?? 0);
    const y = coords.y + (offset?.y ?? 0);

    target.style.setProperty('transform', `translate(${x}px, ${y}px)`);

    scriptDebugger?.drawPoint({ x, y });
}

export function moveMouse({ mouse, coords, offset, scriptDebugger }: MoveMouseParams) {
    const mousePos = addPoints(coords, offset)!;

    mouse.getTarget().style.setProperty('transform', `translate(${mousePos.x}px, ${mousePos.y}px)`);

    scriptDebugger?.drawPoint(addPoints(mousePos, mouse.getCursorOffset())!);
}
