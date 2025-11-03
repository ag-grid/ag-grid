export interface IAriaAnnouncementService {
    readonly beanName: 'ariaAnnounce';
    announceValue(value: string, key: string): void;
}
