import React from 'react';

export const Typography = () => {
    return (
        <>
            <p className="item-label">
                <span>Font Family</span> (system fonts)
            </p>
            <p className="max-text-length">
                -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation
                Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
            </p>

            <p className="item-label">
                <span>Monospace font:</span>
                <code>.monospace-text</code>
            </p>
            <p className="monospace-text max-text-length">Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;</p>

            <div className="grid">
                <div>
                    <p className="item-label">
                        <span>Font weight normal:</span>
                        <code>.normal-weight-text</code>
                    </p>
                    <p className="font-size-large">400</p>
                </div>

                <div>
                    <p className="item-label">
                        <span>Font weight bold:</span>
                        <code>.bold-text</code>
                    </p>
                    <p className="font-size-large bold-text">600</p>
                </div>
            </div>

            <p className="item-label">
                <span>font size extra small</span>
                <code>.font-size-extra-small</code>
            </p>
            <p className="font-size-extra-small max-text-length">
                Voluptatibus ex unde molestiae omnis ea aut odio. Eum dolor ratione qui sed et asperiores. Aut vero
                consequatur quaerat nesciunt perferendis et dolores animi earum. Pariatur exercitationem nostrum.
                Occaecati occaecati eos soluta id. Quis mollitia nobis aut deleniti inventore aut corporis.
            </p>

            <p className="item-label">
                <span>font size small</span>
                <code>.font-size-small</code>
            </p>
            <p className="font-size-small max-text-length">
                Totam iure voluptates. Molestias quae qui molestias odit dolor dignissimos provident commodi porro.
                Exercitationem aut perspiciatis iure dolorum deserunt exercitationem quisquam asperiores consequatur.
                Ipsum facilis ipsum nisi et sint beatae exercitationem sequi adipisci.
            </p>

            <p className="item-label">
                <span>font size medium</span>
                <code>.font-size-medium</code>
            </p>
            <p className="font-size-medium max-text-length">
                Deleniti adipisci sint possimus. Aut harum nihil. Ut a distinctio recusandae officia sint. Minima ut est
                mollitia velit. Reiciendis maiores veritatis beatae magni animi consectetur aliquam. Totam sequi
                voluptas suscipit repudiandae.
            </p>

            <p className="item-label">
                <span>font size large</span>
                <code>.font-size-large</code>
            </p>
            <p className="font-size-large max-text-length">
                Praesentium ea ex qui dolorum non totam. Eveniet iure omnis facilis quisquam incidunt quaerat dolores
                aliquam. Eum voluptas nam aut sit. Omnis sunt cupiditate eaque ratione aut cupiditate. Alias non culpa
                fugiat id architecto.
            </p>

            <p className="item-label">
                <span>font size extra large</span>
                <code>.font-size-extra-large</code>
            </p>
            <p className="font-size-extra-large max-text-length">
                Quasi nesciunt saepe accusamus. Et aut illum. Quod dolores quaerat. Minima dolorum id deleniti quos sit.
                Recusandae iure voluptatem voluptatem mollitia pariatur.{' '}
            </p>

            <p className="item-label">
                <span>font size massive</span>
                <code>.font-size-massive</code>
            </p>
            <p className="font-size-massive max-text-length">
                Quis adipisci molestiae ad ipsa rerum aut minima ea iure. Quasi voluptate porro.
            </p>

            <p className="item-label">
                <span>font size gigantic</span>
                <code>.font-size-gigantic</code>
            </p>
            <p className="font-size-gigantic ">Sunt velit sed et. Quo recusandae dolores error saepe dolores.</p>

            <p className="item-label">
                <span>font size gargantuan</span>
                <code>.font-size-gargantuan</code>
            </p>
            <p className="font-size-gargantuan ">Sunt velit sed et. Quo recusandae dolores error saepe dolores.</p>
        </>
    );
};
