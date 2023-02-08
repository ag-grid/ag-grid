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
            <div className="grid"></div>
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
        </form>
    );
};
