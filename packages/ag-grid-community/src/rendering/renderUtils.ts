/** @return true to exit early */
export type CtrlFunc<C> = (ctrl: C) => boolean | undefined | void;

export function iterateCtrls<C>(ctrls: C[], func: CtrlFunc<C>): boolean {
    for (let i = 0; i < ctrls.length; i++) {
        if (func(ctrls[i])) {
            return true;
        }
    }
    return false;
}
