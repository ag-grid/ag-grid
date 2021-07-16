import { PostConstruct, Autowired } from '../context/context';
import { FocusService } from '../focusService';
import { addCssClass } from '../utils/dom';
import { KeyCode } from '../constants/keyCode';
import { isStopPropagationForAgGrid, stopPropagationForAgGrid } from '../utils/event';
import { BeanStub } from '../context/beanStub';


export class ManagedFocusFeature extends BeanStub {

    public static FOCUS_MANAGED_CLASS = 'ag-focus-managed';

    @Autowired('focusService') protected readonly focusService: FocusService;

    constructor(
        private readonly focusableElement: HTMLElement,
        private readonly shouldStopEventPropagation: (e: KeyboardEvent) => boolean = () => false,
        private readonly onTabKeyDown: (e: KeyboardEvent) => void = (e: KeyboardEvent) => {
            if (e.defaultPrevented) { return; }

            const nextRoot = this.focusService.findNextFocusableElement(this.focusableElement, false, e.shiftKey);
    
            if (!nextRoot) { return; }
    
            nextRoot.focus();
            e.preventDefault();
        },
        private readonly handleKeyDown?: (e: KeyboardEvent) => void,
        private readonly onFocusIn?: (e: FocusEvent) => void,
        private readonly onFocusOut?: (e: FocusEvent) => void
    ) {
        super();
    }

    @PostConstruct
    protected postConstruct(): void {
        addCssClass(this.focusableElement, ManagedFocusFeature.FOCUS_MANAGED_CLASS);

        this.addKeyDownListeners(this.focusableElement);

        if (this.onFocusIn) {
            this.addManagedListener(this.focusableElement, 'focusin', this.onFocusIn);
        }

        if (this.onFocusOut) {
            this.addManagedListener(this.focusableElement, 'focusout', this.onFocusOut);
        }
    }

    private addKeyDownListeners(eGui: HTMLElement): void {
        this.addManagedListener(eGui, 'keydown', (e: KeyboardEvent) => {
            if (e.defaultPrevented || isStopPropagationForAgGrid(e)) { return; }

            if (this.shouldStopEventPropagation(e)) {
                stopPropagationForAgGrid(e);
                return;
            }

            if (e.keyCode === KeyCode.TAB) {
                this.onTabKeyDown(e);
            } else if (this.handleKeyDown) {
                this.handleKeyDown(e);
            }
        });
    }
}
