var React = require('react');
var ReactDOM = require('react-dom');

module ag.react {

    export function reactCellRendererFactory(reactComponent: any): Function {

        return (params: any): any => {

            params.eParentOfValue.addElementAttachedListener( (eCell: Element) => {

                ReactDOM.render(React.createElement(reactComponent, { params: params }), eCell);

                // if you are reading this, and want to do it using jsx, the equivalent is below.
                // however because we don't have the actual class here (just a reference to the class)
                // it can't be built into jsx. besides, the ag-grid-react-component project is so
                // small, i didn't set up jsx for it.
                //ReactDOM.render(<SkillsCellRenderer params={params}/>, eCell);

                // we want to know when the row is taken out of the grid, so that we do React cleanup
                params.api.addVirtualRowListener('virtualRowRemoved', params.rowIndex, () => {
                    ReactDOM.unmountComponentAtNode(eCell);
                });
            });
            // return null to the grid, as we don't want it responsible for rendering
            return null;

        };

    }

}