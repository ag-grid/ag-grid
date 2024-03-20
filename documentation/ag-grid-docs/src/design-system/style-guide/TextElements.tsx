import { Snippet } from '@components/snippet/Snippet';
import React from 'react';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';

export const TextElements: FunctionComponent = () => {
    return (
        <>
            <h2>Text Elements</h2>
            <div className={styles.textElementsList}>
                <p>
                    <strong>Bold</strong>
                </p>
                <p>
                    <em>Italic</em>
                </p>
                <p>
                    <u>Underline</u>
                </p>
                <p>
                    <del>Deleted</del>
                </p>
                <p>
                    <ins>Inserted</ins>
                </p>
                <p>
                    <s>Strikethrough</s>
                </p>
                <p>
                    <small>Small </small>
                </p>
                <p>
                    Text <sub>Sub</sub>
                </p>
                <p>
                    Text <sup>Sup</sup>
                </p>
                <p>
                    <abbr title="Abbreviation" data-tooltip="Abbreviation">
                        Abbr.
                    </abbr>
                </p>
                <p>
                    <mark>Highlighted</mark>
                </p>
                <p>
                    <kbd>Kbd</kbd>
                </p>
                <p>
                    <code>{'${code}'}</code>
                </p>
                <p>
                    <a href="#">Link</a>
                </p>
            </div>

            <p>
                In hic fugit nostrum <strong>Bold</strong> exercitationem aut nam quaerat occaecati. Cumque quo
                explicabo. Mollitia fugiat <em>Italic</em> unde mollitia dolor consequatur incidunt. Quod debitis
                aliquam <u>Underline</u> ipsum quis sed qui aut.
            </p>
            <p>
                Quis dicta et incidunt <del>Deleted</del> mollitia quo vel omnis. Voluptas quibusdam vitae voluptates{' '}
                <ins>Inserted</ins> aspernatur mollitia amet. Id rem magnam at <s>Strikethrough</s> harum a quidem velit
                maiores. Accusamus autem dolorem <small>Small </small> voluptatem fuga cumque<sub>Sub</sub> maxime
                labore<sup>Sup</sup> ut. Aliquid iure sed id incidunt necessitatibus.
            </p>
            <p>
                Eum beatae <kbd>Kbd</kbd> doloremque est harum veniam veniam <code>{'${code}'}</code> ducimus. Et
                dignissimos praesentium placeat <a href="#">link</a> voluptatum eum non. Qui iste dolorum voluptate
                omnis omnis veniam.
            </p>

            <div className={styles.textElementsItem}>
                <code>{`<hr />`}</code>
                <hr />
            </div>

            <div className={styles.textElementsItem}>
                <code>{`<ul>`}</code>
                <ul>
                    <li>Aliquam lobortis lacus eu libero ornare facilisis.</li>
                    <li>
                        Nam et magna at libero scelerisque egestas.
                        <ul>
                            <li>Proin ultricies turpis et volutpat vehicula.</li>
                        </ul>
                    </li>
                    <li>Suspendisse id nisl ut leo finibus vehicula quis eu ex.</li>
                    <li>Proin ultricies turpis et volutpat vehicula.</li>
                </ul>

                <code>{`<ol>`}</code>
                <ol>
                    <li>Aliquam lobortis lacus eu libero ornare facilisis.</li>
                    <li>
                        Nam et magna at libero scelerisque egestas.
                        <ul>
                            <li>Proin ultricies turpis et volutpat vehicula.</li>
                        </ul>
                    </li>
                    <li>Suspendisse id nisl ut leo finibus vehicula quis eu ex.</li>
                    <li>Proin ultricies turpis et volutpat vehicula.</li>
                </ol>

                <code>.list-style-none</code>
                <ul className="list-style-none">
                    <li>Aliquam lobortis lacus eu libero ornare facilisis.</li>
                    <li>
                        Nam et magna at libero scelerisque egestas.
                        <ul>
                            <li>Proin ultricies turpis et volutpat vehicula.</li>
                        </ul>
                    </li>
                    <li>Suspendisse id nisl ut leo finibus vehicula quis eu ex.</li>
                    <li>Proin ultricies turpis et volutpat vehicula.</li>
                </ul>
            </div>

            <div className={styles.textElementsItem}>
                <code>{`<pre>`}</code>
                <pre>{`:root {
    --font-size: 1rem;
    --line-height: 1.5;
    --font-weight: 400;
    --font-weight-thin: 300;
    --font-weight-normal: 400;
    --font-weight-bold: 600;
    --icon-size: 2em;
}`}</pre>
            </div>

            <div className={styles.textElementsItem}>
                <code>{`<Snippet framework="javascript">`}</code>
                <Snippet
                    framework="javascript"
                    content={`const addOne = (x) => {
    // Add one here
    const result = x + 1;
    return result;
}`}
                />
            </div>
        </>
    );
};
