import { SpecResults } from './types';

const init = () => {
    $('.tab-block').each((_, tabBlock) => {
        const selectTab = (name: string) => {
            $(tabBlock)
                .find('img')
                .each((_, img) => {
                const selected = img.getAttribute('data-name') === name;
                img.style.display = selected ? '' : 'none';
            });
            $(tabBlock)
                .find('.tab-button')
                .each((_, button) => {
                const selected = button.textContent!.trim() === name;
                if (selected) {
                    button.classList.add('selected');
                }
                else {
                    button.classList.remove('selected');
                }
            });
        };
        selectTab('difference');
        $(tabBlock)
            .find('.tab-button')
            .click(e => selectTab(e.target.textContent!.trim()));
    });
};

const pageTemplate = (content: string) => /*html*/ `<!doctype html>
<html>
	<head>
		<meta charset="utf-8"/>
        <title>Visual Regression Results</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.js"></script>
        <style>
            img {
                max-width: 100%;
                height: auto;
            }
            .selected {
                font-weight: bold;
            }
        </style>
	</head>
    <body>
    ${content}
    <script>
        (${init})();
    </script>
    </body>
</html>
`;

const getFailureHtml = (result: SpecResults) => /*html*/ `
<div>
    <h2>❌ ${result.name}</h2>
    <div class="tab-block">
        <div class="tab-buttons">
            <button class="tab-button">difference</button>
            <button class="tab-button">original</button>
            <button class="tab-button">new</button>
        </div>
        <img data-name="difference" src="${result.difference}">
        <img data-name="original" src="${result.original}">
        <img data-name="new" src="${result.new}">
    </div>
</div>
`;

const getPassHtml = (result: SpecResults) => /*html*/ `
<div>
    <h2>✅ ${result.name}</h2>
    <img src="${result.original}">
</div>
`;

export const getReportHtml = (results: SpecResults[], inProgress: boolean) => {
    const failures = results.filter(r => r.difference);
    let body = '';
    if (inProgress) {
        body += '<h1>⌛ Report generation in progress...</h1>'
    }
    if (failures.length > 0) {
        body += `<h2>${failures.length} failure${failures.length > 1 ? 's' : ''}</h2>`;
        body += failures.map(getFailureHtml).join('\n\n');
    }
    // const passes = results.filter(r => !r.difference);
    // if (passes.length > 0) {
    //     body += `<h2>${passes.length} passes${passes.length > 1 ? 's' : ''}</h2>`;
    //     body += passes.map(getPassHtml).join('\n\n');
    // }
    return pageTemplate(body);
};
