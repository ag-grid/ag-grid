import {mount} from '@vue/test-utils'
import GridExample from '../GridExample.vue'

const ensureGridApiHasBeenSet = vm => new Promise(function (resolve, reject) {
    (function waitForGridReady() {
        // we need to wait for the gridReady event before we can start interacting with the grid
        // in this case we're looking at the api property in our App component, but it could be anything (ie a boolean flag)
        if (vm.$data.api) {

            // once our condition has been met we can start the tests
            return resolve();
        }

        // not set - wait a bit longer
        setTimeout(waitForGridReady, 20);
    })();
});

let wrapper = null;
describe('GridExample.vue', () => {
    beforeEach((done) => {
        wrapper = mount(GridExample, {});

        // don't start our tests until the grid is ready
        // it doesn't take long for the grid to initialise, but it is some finite amount of time after the component is ready
        ensureGridApiHasBeenSet(wrapper.vm).then(() => done());
    });


    it('grid renders as expected', () => {
        const cells = wrapper.findAll('.ag-cell-value');
        expect(cells.length).toEqual(2);

        expect(cells.at(0).text()).toEqual('Toyota');
        expect(cells.at(1).text()).toEqual('70000');
    });

    it('cell should be editable and editor component usable', () => {
        // wait for the api to be set before continuing
        const componentInstance = wrapper.vm;

        const api = componentInstance.$data.api;

        // we use the API to start and stop editing - in a real e2e test we could actually double click on the cell etc
        api.startEditingCell({
            rowIndex: 0,
            colKey: 'price'
        });

        // update the editor input
        const textInput = wrapper.find('input[type="number"]');
        textInput.setValue(100000);

        // stop editing
        api.stopEditing();

        // test the resulting values in the grid (the edited cell value should have changed)
        const cells = wrapper.findAll('.ag-cell-value');
        expect(cells.length).toEqual(2);

        expect(cells.at(0).text()).toEqual('Toyota');
        expect(cells.at(1).text()).toEqual('200000');
    });
});
