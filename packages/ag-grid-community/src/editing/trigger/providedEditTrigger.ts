import { BaseEditTrigger } from './baseEditTrigger';

export class ProvidedEditTrigger extends BaseEditTrigger {
    shouldStartEditing(
        rowId: string,
        colId?: string,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean {
        if (event instanceof KeyboardEvent) {
            return !!event && event.key === 'Enter';
        }

        const clickCount = this.deriveClickCount();
        const type = event?.type;

        if (type === 'click' && clickCount === 1) {
            return true;
        } else if (type === 'dblclick' && clickCount === 2) {
            return true;
        }

        return false;
    }

    private deriveClickCount() {
        if (this.gos.get('suppressClickEdit') === true) {
            return 0;
        } else if (this.gos.get('singleClickEdit') === true) {
            return 1;
        }

        const params = this.gos.get('experimentalEditingModeV2')?.params;

        return params.clickCount ?? 0;
    }
}
