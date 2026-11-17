import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { ICellRendererParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<ICellRendererParams>,
            required: true,
        },
    },
    template: `
      <div role="gridcell">
      <form>
        <div>
          <p>
            <label>
              Call Id:<br>
              <input type="text" :value="firstRecord.callId">
            </label>
          </p>
          <p>
            <label>
              Number:<br>
              <input type="text" :value="firstRecord.number">
            </label>
          </p>
          <p>
            <label>
              Direction:<br>
              <input type="text" :value="firstRecord.direction">
            </label>
          </p>
        </div>
      </form>
      </div>
    `,
    data: function () {
        return {
            firstRecord: {},
        };
    },
    mounted() {
        this.firstRecord = this.params.data.callRecords[0];

        this.params.eParentOfValue.addEventListener('focus', this.onParentElFocus);
    },
    unmounted() {
        this.params.eParentOfValue.removeEventListener('focus', this.onParentElFocus);
    },
    methods: {
        // called when the cell is refreshed
        refresh() {
            return false;
        },
        onParentElFocus(event: FocusEvent) {
            const currentEl = event.target as HTMLElement;
            const previousEl = event.relatedTarget as HTMLElement | null;
            const previousRowEl = findRowForEl(previousEl);
            const currentRow = currentEl && parseInt(currentEl.getAttribute('row-index')!, 10);
            const previousRow = previousRowEl && parseInt(previousRowEl.getAttribute('row-index')!, 10);

            const inputs = Array.from<HTMLInputElement>(currentEl.querySelectorAll('input')).filter((el) => {
                if (el.checkVisibility) {
                    return el.checkVisibility({
                        checkOpacity: true,
                        checkVisibilityCSS: true,
                    });
                }
                return !!el.offsetParent && window.getComputedStyle(el).visibility === 'visible';
            });

            // Navigating forward, or unknown previous row
            if (!previousRow || currentRow >= previousRow) {
                // Focus on the first input
                inputs[0].focus();
            } else {
                // Navigating backwards
                // Focus on the last input
                inputs[inputs.length - 1].focus();
            }
        },
    },
});

function findRowForEl(el: HTMLElement | null): HTMLElement | null {
    let rowEl = el;
    while (rowEl) {
        rowEl = rowEl.parentElement;
        if (rowEl && rowEl.getAttribute('role') === 'row') {
            return rowEl;
        }
    }

    return null;
}
