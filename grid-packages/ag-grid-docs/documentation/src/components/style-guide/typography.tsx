import React from 'react';

export const Typography = () => {
    return <>
        <p>
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
        </figure>
    </>
}
