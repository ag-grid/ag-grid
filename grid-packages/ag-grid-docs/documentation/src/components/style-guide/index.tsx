import React from 'react';
import './style-guide.scss';

export const StyleGuide = () => {
    return (
        <div className="ag-styles">
            <header className='page-margin'>
                <h1>AG Style Guide</h1>
                <p>All elements and components used in the AG Style Guide.</p>
            </header>

            <main className='page-margin'>
                <section id="typography">
                    <h2>Typography</h2>
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
                            <a href="#">Primary link</a>
                        </p>
                        <p>
                            <a href="#" className="secondary">
                                Secondary link
                            </a>
                        </p>
                        <p>
                            <a href="#" className="contrast">
                                Contrast link
                            </a>
                        </p>
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
                </section>

                <section id="buttons">
                    <h2>Buttons</h2>
                    <div className="grid">
                        <div>
                            <button>Primary</button>
                        </div>
                        <div>
                            <button className="secondary">Secondary</button>
                        </div>
                    </div>
                </section>

                <section id="form">
                    <form>
                        <h2>Form elements</h2>

                        <div>
                            <label htmlFor="search">Search</label>
                            <input type="search" id="search" name="search" placeholder="Search" />
                        </div>

                        <div>
                            <label htmlFor="text">Text</label>
                            <input type="text" id="text" name="text" placeholder="Text" />
                        </div>

                        <div>
                            <label htmlFor="select">Select</label>
                            <select id="select" name="select" required>
                                <option value="">First option</option>
                                <option>Second option</option>
                                <option>Third option</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="range">
                                Range slider
                                <input type="range" min="0" max="100" id="range" name="range" defaultValue="50" />
                            </label>
                        </div>

                        <div className="grid">
                            <label htmlFor="valid">
                                Valid{' '}
                                <input type="text" id="valid" name="valid" placeholder="Valid" aria-invalid="false" />
                            </label>
                            <label htmlFor="invalid">
                                Invalid{' '}
                                <input
                                    type="text"
                                    id="invalid"
                                    name="invalid"
                                    placeholder="Invalid"
                                    aria-invalid="true"
                                />
                            </label>
                            <label htmlFor="disabled">
                                Disabled{' '}
                                <input type="text" id="disabled" name="disabled" placeholder="Disabled" disabled />
                            </label>
                        </div>

                        <div>
                            <fieldset>
                                <legend>
                                    <strong>Checkboxes</strong>
                                </legend>
                                <label htmlFor="checkbox-1">
                                    <input type="checkbox" id="checkbox-1" name="checkbox-1" defaultChecked />{' '}
                                    Checkbox
                                </label>
                                <label htmlFor="checkbox-2">
                                    <input type="checkbox" id="checkbox-2" name="checkbox-2" />{' '}
                                    Checkbox
                                </label>
                            </fieldset>

                            <fieldset>
                                <legend>
                                    <strong>Radio buttons</strong>
                                </legend>
                                <label htmlFor="radio-1">
                                    <input type="radio" id="radio-1" name="radio" value="radio-1" defaultChecked />{' '}
                                    Radio button
                                </label>
                                <label htmlFor="radio-2">
                                    <input type="radio" id="radio-2" name="radio" value="radio-2" />{' '}
                                    Radio button
                                </label>
                            </fieldset>

                            <fieldset>
                                <legend>
                                    <strong>Switches</strong>
                                </legend>
                                <label htmlFor="switch-1">
                                    <input
                                        type="checkbox"
                                        id="switch-1"
                                        name="switch-1"
                                        role="switch"
                                        defaultChecked
                                        className="switch"
                                    />{' '}
                                    Switch
                                </label>
                                <label htmlFor="switch-2">
                                    <input
                                        type="checkbox"
                                        id="switch-2"
                                        name="switch-2"
                                        role="switch"
                                        className="switch"
                                    />{' '}
                                    Switch
                                </label>
                            </fieldset>
                        </div>

                        <input type="reset" value="Reset" />{' '}
                        <input type="submit" value="Submit" />
                    </form>
                </section>

                <section id="tables">
                    <h2>Tables</h2>
                    <figure>
                        <table role="grid">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Heading</th>
                                    <th scope="col">Heading</th>
                                    <th scope="col">Heading</th>
                                    <th scope="col">Heading</th>
                                    <th scope="col">Heading</th>
                                    <th scope="col">Heading</th>
                                    <th scope="col">Heading</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">1</th>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                    <td>Cell</td>
                                </tr>
                            </tbody>
                        </table>
                    </figure>
                </section>

                <article id="article">
                    <h2>Article</h2>
                    <p>
                        Nullam dui arcu, malesuada et sodales eu, efficitur vitae dolor. Sed ultricies dolor non ante
                        vulputate hendrerit. Vivamus sit amet suscipit sapien. Nulla iaculis eros a elit pharetra
                        egestas. Nunc placerat facilisis cursus. Sed vestibulum metus eget dolor pharetra rutrum.
                    </p>
                    <footer>
                        <small>Duis nec elit placerat, suscipit nibh quis, finibus neque.</small>
                    </footer>
                </article>

                <section id="progress">
                    <h2>Progress bar</h2>
                    <progress id="progress-1" value="25" max="100"></progress>
                    <progress id="progress-2"></progress>
                </section>

                <section id="loading">
                    <h2>Loading</h2>
                    <article aria-busy="true"></article>
                    <button aria-busy="true">Please wait…</button>
                </section>
            </main>
        </div>
    );
};
