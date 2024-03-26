import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { setAriaAtomic, setAriaLive, setAriaRelevant } from "../utils/aria";
import { clearElement } from "../utils/dom";
import { debounce } from "../utils/function";

@Bean('ariaAnnouncementService')
export class AriaAnnouncementService extends BeanStub {

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    private descriptionContainer: HTMLElement | null = null;

    constructor() {
        super();

        this.announceValue = debounce(this.announceValue.bind(this), 200);
    }

    @PostConstruct
    private postConstruct(): void {
        const eDocument = this.gos.getDocument();
        const div = this.descriptionContainer = eDocument.createElement('div');
        div.classList.add('ag-aria-description-container');

        setAriaLive(div, 'polite');
        setAriaRelevant(div, 'additions text');
        setAriaAtomic(div, true);

        this.eGridDiv.appendChild(div);
    }

    public announceValue(value: string): void {
        if (!this.descriptionContainer) { return; }
        // screen readers announce a change in content, so we set it to an empty value
        // and then use a setTimeout to force the Screen Reader announcement 
        this.descriptionContainer!.textContent = '';
        setTimeout(() => {
            if (this.isAlive() && this.descriptionContainer) {
                this.descriptionContainer.textContent = value;
            }
        }, 50);
    }

    public destroy(): void {
        super.destroy();

        const { descriptionContainer } = this;

        if (descriptionContainer) {
            clearElement(descriptionContainer);
            if (descriptionContainer.parentElement) {
                descriptionContainer.parentElement.removeChild(descriptionContainer);
            }
        }
        this.descriptionContainer = null;
        (this.eGridDiv as any) = null;
    }
}