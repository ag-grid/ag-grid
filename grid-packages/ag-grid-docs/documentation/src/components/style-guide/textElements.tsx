import React from 'react';

export const TextElements = () => {
    return (
        <>
            <p className="item-label">
                <span>Inline elements</span>
            </p>

            <div className="text-elements-list">
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

            <div>
                <p className="item-label">
                    Horizontal rule <code>hr</code>
                </p>
                <hr />
            </div>

            <div className="grid">
                <div>
                    <p className="item-label">
                        Un ordered list <code>ul</code>
                    </p>
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
                </div>

                <div>
                    <p className="item-label">
                        Ordered list <code>ol</code>
                    </p>
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
                </div>

                <div>
                    <p className="item-label">
                        List style none: <code>.list-style-none</code>
                    </p>
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
            </div>

            <div>
                <p className="item-label">
                    Preformatted text: <code>pre</code>
                </p>
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

            <p className="item-label">
                Heading one: <code>h1</code>
            </p>
            <h1>Heading one</h1>

            <p className="item-label">
                Heading two: <code>h2</code>
            </p>
            <h2>Heading two</h2>

            <p className="item-label">
                Heading three: <code>h3</code>
            </p>
            <h3>Heading three</h3>

            <p className="item-label">
                Heading four: <code>h4</code>
            </p>
            <h4>Heading four</h4>

            <p className="item-label">
                Heading five: <code>h5</code>
            </p>
            <h5>Heading five</h5>

            <p className="item-label">
                Heading six: <code>h6</code>
            </p>
            <h6>Heading six</h6>
        </>
    );
};
