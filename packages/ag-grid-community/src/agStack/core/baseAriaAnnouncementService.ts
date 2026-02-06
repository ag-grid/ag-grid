import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IAriaAnnouncementService } from '../interfaces/iAriaAnnouncementService';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _setAriaAtomic, _setAriaLive, _setAriaRelevant } from '../utils/aria';
import { _getDocument } from '../utils/document';
import { _clearElement } from '../utils/dom';
import { _debounce } from '../utils/function';
import { AgBeanStub } from './agBeanStub';

export class BaseAriaAnnouncementService<
        TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    >
    extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    implements IAriaAnnouncementService
{
    beanName = 'ariaAnnounce' as const;

    private descriptionContainer: HTMLElement | null = null;

    private readonly pendingAnnouncements: Map<string, string> = new Map();
    private lastAnnouncement: string = '';

    constructor() {
        super();

        this.updateAnnouncement = _debounce(this, this.updateAnnouncement.bind(this), 200);
    }

    public postConstruct(): void {
        const beans = this.beans;
        const eDocument = _getDocument(beans);
        const div = (this.descriptionContainer = eDocument.createElement('div'));
        div.classList.add('ag-aria-description-container');

        _setAriaLive(div, 'polite');
        _setAriaRelevant(div, 'additions text');
        _setAriaAtomic(div, true);

        beans.eRootDiv.appendChild(div);
    }

    /**
     * @param key used for debouncing calls
     */
    public announceValue(value: string, key: string): void {
        this.pendingAnnouncements.set(key, value);
        this.updateAnnouncement();
    }

    private updateAnnouncement(): void {
        if (!this.descriptionContainer) {
            return;
        }

        const value = Array.from(this.pendingAnnouncements.values()).join('. ');
        this.pendingAnnouncements.clear();
        // screen readers announce a change in content, so we set it to an empty value
        // and then use a setTimeout to force the Screen Reader announcement
        this.descriptionContainer.textContent = '';
        setTimeout(() => {
            this.handleAnnouncementUpdate(value);
        }, 50);
    }

    private handleAnnouncementUpdate(value: string): void {
        if (!this.isAlive() || !this.descriptionContainer) {
            return;
        }

        let valueToAnnounce = value;
        // if the value is null or an empty string, or if it's a string
        // that only contains spaces and dots, it should not be announced
        if (valueToAnnounce == null || valueToAnnounce.replace(/[ .]/g, '') == '') {
            this.lastAnnouncement = '';
            return;
        }
        // if the announcement is the same (static announcement)
        // we add a zero-width space at the end to force screen readers to announce
        if (this.lastAnnouncement === valueToAnnounce) {
            valueToAnnounce = `${valueToAnnounce}\u200B`;
        }
        this.lastAnnouncement = valueToAnnounce;
        this.descriptionContainer.textContent = valueToAnnounce;
    }

    public override destroy(): void {
        super.destroy();

        const { descriptionContainer } = this;

        if (descriptionContainer) {
            _clearElement(descriptionContainer);
            descriptionContainer.remove();
        }
        this.descriptionContainer = null;
        this.pendingAnnouncements.clear();
    }
}
