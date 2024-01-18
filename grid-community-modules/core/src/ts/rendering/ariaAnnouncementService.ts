import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { setAriaAtomic, setAriaLive, setAriaRelevant } from "../utils/aria";
import { clearElement } from "../utils/dom";

@Bean('ariaAnnouncementService')
export class AriaAnnouncementService extends BeanStub {

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    private descriptionContainer: HTMLElement | null = null;

    @PostConstruct
    private postConstruct(): void {
        const eDocument = this.gridOptionsService.getDocument();
        const div = this.descriptionContainer = eDocument.createElement('div');
        div.classList.add('ag-aria-description-container');

        setAriaLive(div, 'polite');
        setAriaRelevant(div, 'all');
        setAriaAtomic(div, true);

        this.eGridDiv.appendChild(div);
    }

    public announceValue(value: string): void {
        if (!this.descriptionContainer) { return; }
        this.descriptionContainer!.textContent = '';
        setTimeout(() => {
            this.descriptionContainer!.textContent = value;
            console.log(value);
        }, 5);
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