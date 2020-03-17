import * as angular from "angular";
import * as Prism from "prismjs";

import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-java";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-scss";

const LanguageMap: { [key: string]: Prism.LanguageDefinition } = {
    js: Prism.languages.javascript,
    ts: Prism.languages.typescript,
    css: Prism.languages.css,
    sh: Prism.languages.bash,
    html: Prism.languages.html,
    jsx: Prism.languages.jsx,
    java: Prism.languages.java,
    sql: Prism.languages.sql,
    vue: Prism.languages.html,
    diff: Prism.languages.diff,
    scss: Prism.languages.scss
};

export function highlight(code: string, language: string): string {
    const prismLanguage = LanguageMap[language];
    return Prism.highlight(code, prismLanguage);
}
