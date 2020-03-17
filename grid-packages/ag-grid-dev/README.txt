# ag-grid-dev

This package build and test that modules in ag-Grid aren't automatically included in either community or enterprise bundles

The process works in 3 stages:

1:  Within test-config

We run a script that reads module.config.json and for each entry:

- create a module file that will serve as a bundle entry point

for example, for the community package it'll generate:

import 'ag-grid-enterprise/chartsModule';
import 'ag-grid-enterprise';
import {SimpleGrid} from "./grid/SimpleGrid";
new SimpleGrid('#myGrid');

- add an entry to webpack.sh for the bundle to be created

For example, for the charts bundle above the following entry will be added to webpack.sh:

../node_modules/.bin/webpack --config webpack.config.js --entry ./ChartsModule.ts -o ../bundles/ChartsModule.bundle.js

- Add an entry to runTests.sh that will test that the given module ISN'T in a community & enterprise bundle, but is in the module bundle

For example, using the charts module again the following will be added to runTests.sh (edited for clarity):

// shouldn't be in community & enterprise bundles
node moduleParser.js ChartsModule.ts ../bundles/enterprise.bundle.js false
node moduleParser.js ChartsModule.ts ../bundles/community.bundle.js false

// should be in charts bundle
node moduleParser.js ChartsModule.ts ../bundles/ChartsModule.bundle.js true

2: Create the webpack bundles by running webpack.sh

3: Run the actual test - check that modules aren't in community & enterprise bundles, but are in their respective bundle


# module.config.json
{
  "modules": [
    {

      This entry is used by the moduleParser and is the exposed module to it's relevant _src_ file.
      For example
        import  {ChartsModule} from "ag-grid-enterprise/src/modules/chartsModule"
      maps to the entry below
      "moduleSource": {
        "exportedModuleName": "ChartsModule",
        "moduleSource": "ag-grid-enterprise/src/modules/chartsModule"
      },

      The module exposed to the end user
      "exposedModules": [
        "ag-grid-enterprise/chartsModule"
      ],

      // whether to include enterprise as a dependency (ie in the resulting bundle)
      "enterprise": true
    }
  ]
}
