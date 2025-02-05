import { BeanStub } from '../../context/beanStub';
import { _setDisplayed, _setFixedWidth } from '../../utils/dom';

export class SetPinnedWidthFeature extends BeanStub {
    public readonly getWidth: () => number;

    constructor(
        private readonly isLeft: boolean,
        private readonly elements: (HTMLElement | undefined)[]
    ) {
        super();
        this.getWidth = isLeft ? () => this.beans.pinnedCols!.leftWidth : () => this.beans.pinnedCols!.rightWidth;
    }

    public postConstruct(): void {
        this.addManagedEventListeners({
            [`${this.isLeft ? 'left' : 'right'}PinnedWidthChanged` as const]: this.onPinnedWidthChanged.bind(this),
        });
    }

    private onPinnedWidthChanged(): void {
        const width = this.getWidth();
        const displayed = width > 0;

        for (const element of this.elements) {
            if (element) {
                _setDisplayed(element, displayed);
                _setFixedWidth(element, width);
            }
        }
    }
}
