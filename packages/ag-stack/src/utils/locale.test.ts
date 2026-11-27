import { _getLocaleTextFromMap, _translate, _translateTokens } from './locale';

describe('_translateTokens', () => {
    const values = { match: '2', total: '5' };

    test('fills named tokens in the order the translation puts them', () => {
        const translate = _getLocaleTextFromMap({ ariaFindActiveMatch: '全${total}件中${match}件目' });

        expect(_translateTokens(translate, 'ariaFindActiveMatch', 'Match ${match} of ${total}', values)).toBe(
            '全5件中2件目'
        );
    });

    test('fills a custom ${variable} value by position, in the order of the values', () => {
        const translate = _getLocaleTextFromMap({ ariaFindActiveMatch: '${variable} / ${variable}' });

        expect(_translateTokens(translate, 'ariaFindActiveMatch', 'Match ${match} of ${total}', values)).toBe('2 / 5');
    });

    test('matches tokens case-insensitively, leaves unknown tokens and does not substitute inside values', () => {
        const translate = (_key: string, defaultValue: string) => defaultValue.toUpperCase();

        expect(
            _translateTokens(translate, 'key', '${match} of ${total} ${other}', { match: '${total}', total: '$&' })
        ).toBe('${total} OF $& ${OTHER}');
    });

    test('matches a camelCase token name in either the phrase or the values', () => {
        const translate = _getLocaleTextFromMap({ aggFuncColumnName: '${column}の${aggfunc}' });

        expect(_translateTokens(translate, 'aggFuncColumnName', '', { aggFunc: 'Sum', column: 'Gold' })).toBe(
            'GoldのSum'
        );
        expect(
            _translateTokens(_getLocaleTextFromMap(), 'key', '${aggFunc}(${column})', {
                aggFunc: 'Sum',
                column: 'Gold',
            })
        ).toBe('Sum(Gold)');
    });
});

describe('_translate', () => {
    test('fills named tokens from the locale map when given token values', () => {
        const bean = { getLocaleTextFunc: () => _getLocaleTextFromMap({ range: '${to} - ${from}' }) };

        expect(_translate(bean, { range: '(${from}, ${to})' }, 'range', { from: '1', to: '9' })).toBe('9 - 1');
    });
});
