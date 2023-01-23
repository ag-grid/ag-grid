import React from 'react';

export const Typography = () => {
    return <>
        <p className="item-label"><span>Font Family</span> (system fonts)</p>
        <p>-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"</p>

        <p className="item-label"><span>Monospace font:</span><code>.monospace-text</code></p>
        <p className='monospace-text'>Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;</p>

        <div className='grid'>
            <div>
                <p className="item-label"><span>Font weight normal:</span><code>.normal-weight-text</code></p>
                <p className='font-size-large'>400</p>
            </div>

            <div>
                <p className="item-label"><span>Font size extra:</span><code>.bold-text</code></p>
                <p className='font-size-large bold-text'>600</p>
            </div>
        </div>

        <p className="item-label"><span>font-size-extra-small</span><code>.font-size-extra-small</code></p>
        <p className="font-size-extra-small">Voluptatibus ex unde molestiae omnis ea aut odio. Eum dolor ratione qui sed et asperiores. Aut vero consequatur quaerat nesciunt perferendis et dolores animi earum. Pariatur exercitationem nostrum. Occaecati occaecati eos soluta id. Quis mollitia nobis aut deleniti inventore aut corporis.</p>

        <p className="item-label"><span>font-size-small</span><code>.font-size-small</code></p>
        <p className="font-size-small">Totam iure voluptates. Molestias quae qui molestias odit dolor dignissimos provident commodi porro. Exercitationem aut perspiciatis iure dolorum deserunt exercitationem quisquam asperiores consequatur. Ipsum facilis ipsum nisi et sint beatae exercitationem sequi adipisci.</p>

        <p className="item-label"><span>font-size-medium</span><code>.font-size-medium</code></p>
        <p className="font-size-medium">Deleniti adipisci sint possimus. Aut harum nihil. Ut a distinctio recusandae officia sint. Minima ut est mollitia velit. Reiciendis maiores veritatis beatae magni animi consectetur aliquam. Totam sequi voluptas suscipit repudiandae.</p>

        <p className="item-label"><span>font-size-large</span><code>.font-size-large</code></p>
        <p className="font-size-large">Praesentium ea ex qui dolorum non totam. Eveniet iure omnis facilis quisquam incidunt quaerat dolores aliquam. Eum voluptas nam aut sit. Omnis sunt cupiditate eaque ratione aut cupiditate. Alias non culpa fugiat id architecto.</p>

        <p className="item-label"><span>font-size-extra-large</span><code>.font-size-extra-large</code></p>
        <p className="font-size-extra-large">Quasi nesciunt saepe accusamus. Et aut illum. Quod dolores quaerat. Minima dolorum id deleniti quos sit. Recusandae iure voluptatem voluptatem mollitia pariatur. </p>

        <p className="item-label"><span>font-size-massive</span><code>.font-size-massive</code></p>
        <p className="font-size-massive">Quis adipisci molestiae ad ipsa rerum aut minima ea iure. Quasi voluptate porro.</p>

        <p className="item-label"><span>font-size-gigantic</span><code>.font-size-gigantic</code></p>
        <p className="font-size-gigantic">Sunt velit sed et. Quo recusandae dolores error saepe dolores.</p>


        {/* <p>
            Aliquam lobortis vitae nibh nec rhoncus. Morbi mattis neque eget efficitur feugiat. Vivamus
            porta nunc a erat mattis, mattis feugiat turpis pretium. Quisque sed tristique felis.
        </p>

        <blockquote>
            "Maecenas vehicula metus tellus, vitae congue turpis hendrerit non. Nam at dui sit amet ipsum
            cursus ornare."
            <footer>
                <cite>- Phasellus eget lacinia</cite>
            </footer>
        </blockquote>

        <h3>Lists</h3>
        <ul>
            <li>Aliquam lobortis lacus eu libero ornare facilisis.</li>
            <li>Nam et magna at libero scelerisque egestas.</li>
            <li>Suspendisse id nisl ut leo finibus vehicula quis eu ex.</li>
            <li>Proin ultricies turpis et volutpat vehicula.</li>
        </ul>

        <h3>Inline text elements</h3>
        <div className="grid">
            <p>
                <strong>Bold</strong>
            </p>
            <p>
                <em>Italic</em>
            </p>
            <p>
                <u>Underline</u>
            </p>
        </div>
        <div className="grid">
            <p>
                <del>Deleted</del>
            </p>
            <p>
                <ins>Inserted</ins>
            </p>
            <p>
                <s>Strikethrough</s>
            </p>
        </div>
        <div className="grid">
            <p>
                <small>Small </small>
            </p>
            <p>
                Text <sub>Sub</sub>
            </p>
            <p>
                Text <sup>Sup</sup>
            </p>
        </div>
        <div className="grid">
            <p>
                <abbr title="Abbreviation" data-tooltip="Abbreviation">
                    Abbr.
                </abbr>
            </p>
            <p>
                <mark>Highlighted</mark>
            </p>
        </div>
        <div className="grid">
            <p>
                <kbd>Kbd</kbd>
            </p>
            <p>
                <code>{'${code}'}</code>
            </p>
        </div>
        <div className="grid">
            <p>
                <a href="#">Link</a>
            </p>
        </div>

        <div>
            <p>In hic fugit nostrum <strong>Bold</strong> exercitationem aut nam quaerat occaecati. Cumque quo explicabo. Mollitia fugiat <em>Italic</em> unde mollitia dolor consequatur incidunt. Quod debitis aliquam <u>Underline</u> ipsum quis sed qui aut.</p>
            <p>Quis dicta et incidunt <del>Deleted</del> mollitia quo vel omnis. Voluptas quibusdam vitae voluptates <ins>Inserted</ins> aspernatur mollitia amet. Id rem magnam at <s>Strikethrough</s> harum a quidem velit maiores. Accusamus autem dolorem <small>Small </small> voluptatem fuga cumque<sub>Sub</sub> maxime labore<sup>Sup</sup> ut. Aliquid iure sed id incidunt necessitatibus.</p>
            <p>Eum beatae <kbd>Kbd</kbd> doloremque est harum veniam veniam <code>{'${code}'}</code> ducimus. Et dignissimos praesentium placeat <a href="#">link</a> voluptatum eum non. Qui iste dolorum voluptate omnis omnis veniam.</p>
        </div>

        <h3>Heading 3</h3>
        <p>
            Integer bibendum malesuada libero vel eleifend. Fusce iaculis turpis ipsum, at efficitur sem
            scelerisque vel. Aliquam auctor diam ut purus cursus fringilla. Class aptent taciti sociosqu ad
            litora torquent per conubia nostra, per inceptos himenaeos.
        </p>
        <h4>Heading 4</h4>
        <p>
            Cras fermentum velit vitae auctor aliquet. Nunc non congue urna, at blandit nibh. Donec ac
            fermentum felis. Vivamus tincidunt arcu ut lacus hendrerit, eget mattis dui finibus.
        </p>
        <h5>Heading 5</h5>
        <p>
            Donec nec egestas nulla. Sed varius placerat felis eu suscipit. Mauris maximus ante in consequat
            luctus. Morbi euismod sagittis efficitur. Aenean non eros orci. Vivamus ut diam sem.
        </p>
        <h6>Heading 6</h6>
        <p>
            Ut sed quam non mauris placerat consequat vitae id risus. Vestibulum tincidunt nulla ut tortor
            posuere, vitae malesuada tortor molestie. Sed nec interdum dolor. Vestibulum id auctor nisi, a
            efficitur sem. Aliquam sollicitudin efficitur turpis, sollicitudin hendrerit ligula semper id.
            Nunc risus felis, egestas eu tristique eget, convallis in velit.
        </p>

        <figure>
            <img src="http://placekitten.com/300/200" alt="AG Grid" />
            <figcaption>
                Image from{' '}
                <a href="https://placekitten.com/" target="_blank">
                    Placeholder Kitten
                </a>
            </figcaption>
        </figure> */}

    </>
}
