import { BaseAriaAnnouncementService } from './baseAriaAnnouncementService';

describe('BaseAriaAnnouncementService', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    const createService = () => {
        const service = new BaseAriaAnnouncementService<any, any, any, any, any>();
        const container = document.createElement('div');
        service.setDescriptionContainer(container);
        vi.runAllTimers();
        return { container, service };
    };

    test('does not deliver a same-key announcement cancelled during the repeat delay', () => {
        vi.useFakeTimers();
        const { container, service } = createService();

        service.announceValue('Stale validation error', 'editorValidation');
        vi.advanceTimersByTime(200); // leaves the debounce queue and enters the repeat delay
        service.announceValue('', 'editorValidation');
        vi.advanceTimersByTime(50);

        expect(container.textContent).toBe('');

        vi.runAllTimers();
        expect(container.textContent).toBe('');
        service.destroy();
    });

    test('retains unrelated announcements when one delayed key is superseded', () => {
        vi.useFakeTimers();
        const { container, service } = createService();

        service.announceValue('Stale validation error', 'editorValidation');
        service.announceValue('Selection changed', 'rowSelection');
        vi.advanceTimersByTime(200);
        service.announceValue('', 'editorValidation');
        vi.advanceTimersByTime(50);

        expect(container.textContent).toBe('Selection changed');

        service.destroy();
    });
});
