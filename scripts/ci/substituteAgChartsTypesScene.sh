#!/bin/bash

# No-op. AG Grid no longer reads _Scene or _Util from AG Charts, nor imports 'ag-charts-types/scene', so there is
# nothing to substitute. Kept because AG Charts' integrated-charts-test.yml still calls this script; delete it once that
# call is removed (AG-18822).

exit 0
