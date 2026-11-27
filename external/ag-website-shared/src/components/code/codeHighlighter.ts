import type { DecorationItem } from 'shiki';
import { createHighlighterCore } from 'shiki/core';
import type { HighlighterCore, ThemeRegistrationAny } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { bundledLanguages } from 'shiki/langs';
import type { BundledLanguage } from 'shiki/langs';

import agDocsTheme from './theme.json';

// The JavaScript regex engine, not Shiki's default Oniguruma one: that is a 622 KB WASM module, and
// compiling it needs 'wasm-unsafe-eval' in the site CSP.
const highlighterPromise = createHighlighterCore({
    themes: [agDocsTheme as ThemeRegistrationAny],
    engine: createJavaScriptRegexEngine(),
});

let readyHighlighter: HighlighterCore | undefined;
highlighterPromise.then((highlighter) => {
    readyHighlighter = highlighter;
});

// Grammars load on first use: the JavaScript-family ones are around 170 KB each.
export async function loadLanguages(langs: BundledLanguage[]) {
    const highlighter = await highlighterPromise;
    await highlighter.loadLanguage(...langs.map((lang) => bundledLanguages[lang]));
}

export async function highlightCode(code: string, lang: BundledLanguage, decorations: DecorationItem[]) {
    const highlighter = await highlighterPromise;
    await highlighter.loadLanguage(bundledLanguages[lang]);
    return highlighter.codeToHtml(code, { lang, theme: 'ag-docs', decorations });
}

/** Highlights without waiting, or returns `undefined` if the highlighter or the grammar is still loading. */
export function highlightCodeSync(code: string, lang: BundledLanguage, decorations: DecorationItem[]) {
    if (!readyHighlighter?.getLoadedLanguages().includes(lang)) {
        return undefined;
    }
    return readyHighlighter.codeToHtml(code, { lang, theme: 'ag-docs', decorations });
}
