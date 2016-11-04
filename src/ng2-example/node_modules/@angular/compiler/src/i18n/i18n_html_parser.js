/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DEFAULT_INTERPOLATION_CONFIG } from '../ml_parser/interpolation_config';
import { ParseTreeResult } from '../ml_parser/parser';
import { mergeTranslations } from './extractor_merger';
import { MessageBundle } from './message_bundle';
import { Xliff } from './serializers/xliff';
import { Xmb } from './serializers/xmb';
import { Xtb } from './serializers/xtb';
import { TranslationBundle } from './translation_bundle';
export var I18NHtmlParser = (function () {
    // TODO(vicb): transB.load() should not need a msgB & add transB.resolve(msgB,
    // interpolationConfig)
    // TODO(vicb): remove the interpolationConfig from the Xtb serializer
    function I18NHtmlParser(_htmlParser, _translations, _translationsFormat) {
        this._htmlParser = _htmlParser;
        this._translations = _translations;
        this._translationsFormat = _translationsFormat;
    }
    I18NHtmlParser.prototype.parse = function (source, url, parseExpansionForms, interpolationConfig) {
        if (parseExpansionForms === void 0) { parseExpansionForms = false; }
        if (interpolationConfig === void 0) { interpolationConfig = DEFAULT_INTERPOLATION_CONFIG; }
        var parseResult = this._htmlParser.parse(source, url, parseExpansionForms, interpolationConfig);
        if (!this._translations || this._translations === '') {
            // Do not enable i18n when no translation bundle is provided
            return parseResult;
        }
        // TODO(vicb): add support for implicit tags / attributes
        var messageBundle = new MessageBundle(this._htmlParser, [], {});
        var errors = messageBundle.updateFromTemplate(source, url, interpolationConfig);
        if (errors && errors.length) {
            return new ParseTreeResult(parseResult.rootNodes, parseResult.errors.concat(errors));
        }
        var serializer = this._createSerializer(interpolationConfig);
        var translationBundle = TranslationBundle.load(this._translations, url, messageBundle, serializer);
        return mergeTranslations(parseResult.rootNodes, translationBundle, interpolationConfig, [], {});
    };
    I18NHtmlParser.prototype._createSerializer = function (interpolationConfig) {
        var format = (this._translationsFormat || 'xlf').toLowerCase();
        switch (format) {
            case 'xmb':
                return new Xmb();
            case 'xtb':
                return new Xtb(this._htmlParser, interpolationConfig);
            case 'xliff':
            case 'xlf':
            default:
                return new Xliff(this._htmlParser, interpolationConfig);
        }
    };
    return I18NHtmlParser;
}());
//# sourceMappingURL=i18n_html_parser.js.map