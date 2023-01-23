import React from 'react';

export const Form = () => {
    return <form>
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
            <label htmlFor="range">Range slider</label>
            <input type="range" min="0" max="100" id="range" name="range" defaultValue="50" />
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
}