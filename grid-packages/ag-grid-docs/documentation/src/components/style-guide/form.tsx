import React from 'react';

export const Form = () => {
    return (
        <form>
            <div className="grid">
                <div>
                    <p className="item-label">
                        Text input <code>input type="text"</code>
                    </p>
                    <input type="text" id="text" name="text" placeholder="Text" />
                </div>

                <div>
                    <p className="item-label">
                        Search input <code>input type="search"</code>
                    </p>
                    <input type="search" id="search" name="search" placeholder="Search" />
                </div>

                <div>
                    <p className="item-label">
                        Select <code>select</code>
                    </p>
                    <select id="select" name="select" required>
                        <option value="">First option</option>
                        <option>Second option</option>
                        <option>Third option</option>
                    </select>
                </div>
            </div>
            <div>
                <p className="item-label">
                    Range <code>input type="range"</code>
                </p>
                <input type="range" min="0" max="100" id="range" name="range" defaultValue="50" />
            </div>
            <div className="grid">
                <div>
                    <p className="item-label">
                        Checkbox <code>input type="checkbox"</code>
                    </p>
                    <div>
                        <label htmlFor="checkbox-1">
                            <input type="checkbox" id="checkbox-1" name="checkbox-1" defaultChecked /> Checkbox one
                        </label>
                    </div>
                    <div>
                        <label htmlFor="checkbox-2">
                            <input type="checkbox" id="checkbox-2" name="checkbox-2" /> Checkbox Two
                        </label>
                    </div>
                </div>

                <div>
                    <p className="item-label">
                        Radio <code>input type="radio"</code>
                    </p>
                    <div>
                        <label htmlFor="radio-1">
                            <input type="radio" id="radio-1" name="radio" value="radio-1" defaultChecked /> Radio button
                            one
                        </label>
                    </div>
                    <div>
                        <label htmlFor="radio-2">
                            <input type="radio" id="radio-2" name="radio" value="radio-2" /> Radio button two
                        </label>
                    </div>
                </div>

                <div>
                    <p className="item-label">
                        Switch <code>input type="checkbox" class="switch"</code>
                    </p>
                    <div>
                        <label htmlFor="switch-1">
                            <input
                                type="checkbox"
                                id="switch-1"
                                name="switch-1"
                                role="switch"
                                defaultChecked
                                className="switch"
                            />{' '}
                            Switch one
                        </label>
                    </div>
                    <div>
                        <label htmlFor="switch-2">
                            <input type="checkbox" id="switch-2" name="switch-2" role="switch" className="switch" />{' '}
                            Switch two
                        </label>
                    </div>
                </div>
            </div>
            <p className="item-label">
                Reset & Submit <code>input type="reset/submit"</code>
            </p>
            <input type="reset" value="Reset" /> <input type="submit" value="Submit" />
            <div className="grid">
                <div className="input-group">
                    <p className="item-label">
                        Container <code>.input-field</code> with <code>label</code>
                    </p>
                    <div className="input-field">
                        <label htmlFor="text-with-label">Input label</label>
                        <input type="text" id="text-with-label" name="text-with-label" placeholder="Text with label" />
                    </div>
                    <div className="input-field">
                        <label htmlFor="text-with-label-req">
                            Input label<span className="req">*</span>
                        </label>
                        <input
                            type="text"
                            id="text-with-label-req"
                            name="text-with-label-req"
                            placeholder="Text required"
                        />
                    </div>
                    <div className="input-field">
                        <label htmlFor="select-with-label">Select</label>
                        <select id="select-with-label" name="select-with-label" required>
                            <option value="">First option</option>
                            <option>Second option</option>
                            <option>Third option</option>
                        </select>
                    </div>
                </div>
                <div className="input-group">
                    <p className="item-label">
                        Container <code>.input-field.inline</code> with <code>label</code>
                    </p>
                    <div className="input-field inline">
                        <label htmlFor="text-with-label-inline" className="input-label-inline">
                            Input label
                        </label>
                        <input
                            type="text"
                            id="text-with-label-inline"
                            name="text-with-label-inline"
                            placeholder="Text inline"
                        />
                    </div>
                    <div className="input-field inline">
                        <label htmlFor="text-with-label-req-inline" className="input-label-inline">
                            Input label<span className="req">*</span>
                        </label>
                        <input
                            type="text"
                            id="text-with-label-req-inline"
                            name="text-with-label-req-inline"
                            placeholder="Text inline required"
                        />
                    </div>
                    <div className="input-field inline">
                        <label htmlFor="select-with-label-inline">Select</label>
                        <select id="select-with-label-inline" name="select-with-label-inline" required>
                            <option value="">First option</option>
                            <option>Second option</option>
                            <option>Third option</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="grid">
                <div className="input-group">
                    <p className="item-label">
                        Container <code>.input-field.input-error</code> with <code>label</code>
                    </p>
                    <div className="input-field input-error">
                        <label htmlFor="text-with-label-error">Input error</label>
                        <input
                            type="text"
                            id="text-with-label-error"
                            name="text-with-label-error"
                            placeholder="Text with label + error"
                        />
                        <div className="error">Please provide a valid value.</div>
                    </div>
                    <div className="input-field input-error">
                        <label htmlFor="select-with-label-error">Select error</label>
                        <select id="select-with-label-error" name="select-with-label-error" required>
                            <option value="">First option</option>
                            <option>Second option</option>
                            <option>Third option</option>
                        </select>
                        <div className="error">Please select a valid value.</div>
                    </div>
                </div>
                <div className="input-group">
                    <p className="item-label">
                        Container <code>.input-field.inline.input-error</code> with <code>label</code>
                    </p>
                    <div className="input-field inline input-error">
                        <label htmlFor="text-with-label-inline-error">Input error</label>
                        <input
                            type="text"
                            id="text-with-label-inline-error"
                            name="text-with-label-inline-error"
                            placeholder="Text inline + error"
                        />
                        <div className="error">Please provide a valid value.</div>
                    </div>

                    <div className="input-field inline input-error">
                        <label htmlFor="select-with-label-inline-error">Select</label>
                        <select id="select-with-label-inline-error" name="select-with-label-inline-error" required>
                            <option value="">First option</option>
                            <option>Second option</option>
                            <option>Third option</option>
                        </select>
                        <div className="error">Please select a valid value.</div>
                    </div>
                </div>
            </div>
            <div className="grid">
                <div className="input-group">
                    <p className="item-label">
                        Extra info <code>.extra-info</code>
                    </p>
                    <div className="input-field">
                        <label htmlFor="text-with-extra-info">Input error</label>
                        <input
                            type="text"
                            id="text-with-extra-info"
                            name="text-with-extra-info"
                            placeholder="Text with extra info"
                        />
                        <div className="extra-info">Some extra info</div>
                    </div>
                </div>
                <div className="input-group">
                    <p className="item-label">
                        Extra info <code>.extra-info</code> inside <code>.input-error</code>
                    </p>
                    <div className="input-field input-error">
                        <label htmlFor="text-with-extra-info-error">Input error</label>
                        <input
                            type="text"
                            id="text-with-extra-info-error"
                            name="text-with-extra-info-error"
                            placeholder="Text with extra info"
                        />
                        <div className="error">Please provide a valid value.</div>
                        <div className="extra-info">Some extra info</div>
                    </div>
                </div>
            </div>
            <div className="grid">
                <div>
                    <p className="item-label">
                        Checkbox with <code>.input-error</code> container
                    </p>
                    <div className="input-error">
                        <label htmlFor="checkbox-error">
                            <input type="checkbox" id="checkbox-error" name="checkbox-error" /> Checkbox
                        </label>
                        <div className="error">Please check the checkbox.</div>
                    </div>
                </div>
                <div>
                    <p className="item-label">
                        Radio button with <code>.input-error</code> container
                    </p>
                    <div className="input-error">
                        <label htmlFor="radio-error">
                            <input type="radio" id="radio-error" name="radio" value="radio-error" /> Radio button
                        </label>
                        <div className="error">Please select the radio button.</div>
                    </div>
                </div>
                <div>
                    <p className="item-label">
                        Switch with <code>.input-error</code> container
                    </p>
                    <div className="input-error">
                        <label htmlFor="switch-error">
                            <input
                                type="checkbox"
                                id="switch-error"
                                name="switch-error"
                                role="switch"
                                className="switch"
                            />{' '}
                            Switch
                        </label>
                        <div className="error">Please toggle the switch.</div>
                    </div>
                </div>
            </div>
        </form>
    );
};
