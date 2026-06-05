/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IAriaAnnouncementService {
    readonly beanName: 'ariaAnnounce';
    announceValue(value: string, key: string): void;
}
