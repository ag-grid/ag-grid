import { Link } from 'gatsby';
import React from "react";
import GlobalContextConsumer from './GlobalContext';
import './framework-selector.scss';

export default function FrameworkSelector({ path, currentFramework }) {
    if (!currentFramework) { return null; }

    return <GlobalContextConsumer>
        {({ useFunctionalReact, set }) =>
            <div className="framework-selector">
                {['javascript', 'angular', 'react', 'vue'].map(framework => {
                    const isSelected = framework === currentFramework;

                    return <div key={framework} className={`framework-selector__option ${isSelected ? 'framework-selector__option--selected' : ''}`}>
                        <Link
                            to={`${path.replace(`/${currentFramework}/`, `/${framework}/`)}`}
                            className="framework-selector__thumbnail">
                            <img src={`/fw-logos/${framework}.svg`} alt={framework} />
                        </Link>
                        {framework === 'react' && isSelected && <ReactVersionSelector useFunctionalReact={useFunctionalReact} onChange={event => set({ useFunctionalReact: JSON.parse(event.target.value) })} />}
                    </div>;
                })}
            </div>
        }
    </GlobalContextConsumer>;
}

const ReactVersionSelector = ({ useFunctionalReact, onChange }) => {
    return <select value={JSON.stringify(useFunctionalReact)} onChange={onChange} onBlur={onChange} className="framework-selector__react-version-selector">
        <option value="false">Classes</option>
        <option value="true">Hooks</option>
    </select>;
};