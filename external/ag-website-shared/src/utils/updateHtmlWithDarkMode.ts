interface Params {
    html: string;
    isDarkMode: boolean;
}

/*
 * Update given html with appropriate dark mode class
 *
 * Useful for JavaScript and Typescript html files, where
 * the ag-theme html class is in the html and not generated
 * by JavaScript
 */
export const updateHtmlWithDarkMode = ({ html, isDarkMode }: Params) => {
    if (!isDarkMode) {
        return html;
    }

    const [, htmlClasses] = html.match(/class="(.*)"/) || [];
    const agClass = htmlClasses?.split(' ').find((c) => c.startsWith('ag-theme'));

    return agClass ? html.replace(agClass, `${agClass}-dark`) : html;
};
