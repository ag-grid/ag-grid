import type { LocaleTextFunc } from 'ag-stack';

import { _formatValidationMessages } from './validationMessages';

const translateWithSeparator =
    (separator: string): LocaleTextFunc =>
    (key: string, defaultValue: string) =>
        key === 'tooltipValidationErrorSeparator' ? separator : defaultValue;

describe('_formatValidationMessages', () => {
    test.each([
        { messages: [], expected: '' },
        { messages: ['A', 'B'], expected: 'A. B' },
        { messages: ['A.', 'B?'], expected: 'A.. B?' },
        { messages: [' A ', ''], expected: ' A . ' },
    ])('preserves inline English messages: $messages', ({ messages, expected }) => {
        expect(_formatValidationMessages(messages, translateWithSeparator('. '), 'inline')).toBe(expected);
    });

    test.each([
        { messages: ['A', 'B'], separator: '. ', expected: 'A. B.' },
        { messages: [' A ', '', 'B?'], separator: '. ', expected: 'A. B?' },
        { messages: ['甲', '乙'], separator: '。', expected: '甲。乙。' },
        { messages: ['甲。', '乙'], separator: '。', expected: '甲。乙。' },
        { messages: ['甲。」', '乙。』', '丙。】'], separator: '。', expected: '甲。」乙。』丙。】' },
        { messages: ['甲', '乙'], separator: '。 ', expected: '甲。 乙。' },
        { messages: ['A', 'B'], separator: '; ', expected: 'A; B.' },
        { messages: ['A', 'B'], separator: ' / ', expected: 'A / B.' },
        { messages: ['Complete！', 'Question？', 'سؤال؟'], separator: '. ', expected: 'Complete！ Question？ سؤال؟' },
    ])('formats announcement messages with separator $separator: $messages', ({ messages, separator, expected }) => {
        expect(_formatValidationMessages(messages, translateWithSeparator(separator), 'announcement')).toBe(expected);
    });
});
