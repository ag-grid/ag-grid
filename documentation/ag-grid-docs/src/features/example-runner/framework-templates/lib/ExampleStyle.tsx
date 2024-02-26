import React from 'react';

const css = String.raw;

/**
 * These are the CSS styles shared by all examples.
 */
export const ExampleStyle = ({ rootSelector, extraStyles }: { rootSelector?: string; extraStyles?: string }) => {
    const styles = css`
        :root {
            position: absolute;
            top: 0;
            left: 0;
            padding: 0;
            overflow: hidden;
            font-family: -apple-system, 'system-ui', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
                'Liberation Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
                'Noto Color Emoji';
        }

        :root[data-dark-mode='true'] {
            background: #192232;
            color: white;
        }

        :root,
        body${rootSelector ? `, ${rootSelector}` : ''} {
            height: 100%;
            width: 100%;
            margin: 0;
            box-sizing: border-box;
        }

        ${rootSelector ?? 'body'} {
            display: grid;
            grid-auto-rows: minmax(0, 1fr);
            grid-auto-columns: minmax(0, 1fr);
            padding: 1rem;
        }

        [data-ag-charts] {
            overflow: hidden;
        }

        /* Center charts with explicit width and heights */
        .ag-chart-wrapper {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        button:not(#myGrid button, #myChart button, button[class*='ag-'], .ag-chart-context-menu button) {
            --background-color: transparent;
            --text-color: #212529;
            --color-border-primary: #d0d5dd;
            --hover-background-color: rgba(0, 0, 0, 0.1);

            appearance: none;
            border: 1px solid var(--color-border-primary);
            border-radius: 6px;
            height: 36px;
            color: var(--text-color);
            background-color: var(--background-color);
            cursor: pointer;
            display: inline-block;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.01em;
            padding: 0.375em 1em 0.5em;
            white-space: nowrap;
            margin-right: 6px;
            margin-bottom: 8px;
            transition: background-color 0.25s ease-in-out;
        }

        button:not(#myGrid button, #myChart button, button[class*='ag-'], .ag-chart-context-menu button):hover {
            background-color: var(--hover-background-color);
        }

        :root[data-dark-mode='true']
            button:not(#myGrid button, #myChart button, button[class*='ag-'], .ag-chart-context-menu button) {
            --text-color: #f8f9fa;
            --color-border-primary: rgba(255, 255, 255, 0.2);
            --hover-background-color: #2a343e;
        }

        ${extraStyles ? extraStyles : ''}
    `;

    return <style media="only screen" dangerouslySetInnerHTML={{ __html: styles }}></style>;
};
