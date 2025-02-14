import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';

export class HoverFeature extends BeanStub {
    constructor(
        private readonly columns: AgColumn[],
        private readonly element: HTMLElement
    ) {
        super();
    }

    private destroyManagedListeners: (() => void)[] = [];

    public postConstruct(): void {
        this.addManagedPropertyListener('columnHoverHighlight', ({ currentValue }) => {
            this.enableFeature(currentValue);
        });
        this.enableFeature();
    }

    private enableFeature = (enabled?: boolean) => {
        const { beans, gos, element, columns } = this;
        const colHover = beans.colHover!;
        const active = enabled ?? !!gos.get('columnHoverHighlight');

        if (active) {
            this.destroyManagedListeners = this.addManagedElementListeners(element, {
                mouseover: colHover.setMouseOver.bind(colHover, columns),
                mouseout: colHover.clearMouseOver.bind(colHover),
            });
        } else {
            this.destroyManagedListeners.forEach((fn) => fn());
            this.destroyManagedListeners = [];
        }
    };

    public override destroy() {
        super.destroy();
        (this.destroyManagedListeners as any) = null;
    }
}
