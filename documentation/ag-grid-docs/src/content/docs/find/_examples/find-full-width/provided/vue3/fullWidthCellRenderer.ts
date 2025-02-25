import type { FindPart } from 'ag-grid-community';

import { getLatinText } from './data';

export default {
    template: `
      <div class="full-width-panel" v-on:wheel.stop="">
          <div class="full-width-flag">
            <img border="0"
                 :src="imgSrc"/>
          </div>
          <div class="full-width-summary">
            <span class="full-width-title">{{ params.node.data.name }}</span>
            <br/>
            <label>
              <b>Population:</b>
              {{ params.node.data.population }}
            </label>
            <br/>
            <label>
              <b>Language:</b>
              {{ params.node.data.language }}
            </label>
            <br/>
          </div>
          <div class="full-width-center">
            <template v-for="parts in textParts">
              <p>
                <template v-for="part in parts">
                  <mark v-if="part.match" :class="['ag-find-match', part.activeMatch ? 'ag-find-active-match' : '']">{{ part.value }}</mark>
                  <template v-if="!part.match">{{ part.value }}</template>
                </template>
              </p>
            </template>
          </div>
      </div>
    `,
    data: function () {
        return {
            imgSrc: null,
            textParts: [],
        };
    },
    beforeMount() {
        this.updateDisplay(this.params);
    },
    methods: {
        refresh(params) {
            this.updateDisplay(params);
            return true;
        },
        updateDisplay(params) {
            this.imgSrc = `https://www.ag-grid.com/example-assets/large-flags/${this.params.node.data.code}.png`;
            const { api, node } = params;
            const paragraphs = ['Sample Text in a Paragraph', ...getLatinText()];
            const textParts: FindPart[][] = [];
            let precedingNumMatches = 0;
            for (const paragraph of paragraphs) {
                const parts = api.findGetParts({
                    value: paragraph,
                    node,
                    column: null,
                    precedingNumMatches,
                });
                textParts.push(parts);
                precedingNumMatches += parts.filter((part) => part.match).length;
            }
            this.textParts = textParts;
        },
    },
};
