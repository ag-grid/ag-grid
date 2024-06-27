import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { _setAriaAtomic, _setAriaLive, _setAriaRelevant } from '../utils/aria';
import { _clearElement } from '../utils/dom';
import { _debounce } from '../utils/function';

export class AriaAnnouncementService extends BeanStub implements NamedBean {
    beanName = 'ariaAnnouncementService' as const;

    private eGridDiv: HTMLElement;

    public wireBeans(beans: BeanCollection): void {
        this.eGridDiv = beans.eGridDiv;
    }

    private descriptionContainer: HTMLElement | null = null;

    constructor() {
        super();

        this.announceValue = _debounce(this.announceValue.bind(this), 200);
    }

    public postConstruct(): void {
        const eDocument = this.gos.getDocument();
        const div = (this.descriptionContainer = eDocument.createElement('div'));
        div.classList.add('ag-aria-description-container');

        _setAriaLive(div, 'polite');
        _setAriaRelevant(div, 'additions text');
        _setAriaAtomic(div, true);

        this.eGridDiv.appendChild(div);
    }

    public announceValue(value: string): void {
        if (!this.descriptionContainer) {
            return;
        }
        // screen readers announce a change in content, so we set it to an empty value
        // and then use a setTimeout to force the Screen Reader announcement
        this.descriptionContainer!.textContent = '';
        setTimeout(() => {
            if (this.isAlive() && this.descriptionContainer) {
                this.descriptionContainer.textContent = value;
            }
        }, 50);
    }

    public override destroy(): void {
        super.destroy();

        const { descriptionContainer } = this;

        if (descriptionContainer) {
            _clearElement(descriptionContainer);
            if (descriptionContainer.parentElement) {
                descriptionContainer.parentElement.removeChild(descriptionContainer);
            }
        }
        this.descriptionContainer = null;
        (this.eGridDiv as any) = null;
    }
}
