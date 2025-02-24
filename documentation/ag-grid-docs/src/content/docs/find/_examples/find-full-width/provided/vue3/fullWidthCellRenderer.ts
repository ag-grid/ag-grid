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
            <p>
              <template v-for="part in sampleTextParts">
                <mark v-if="part.match" :class="['ag-find-match', part.activeMatch ? 'ag-find-active-match' : '']">{{ part.value }}</mark>
                <template v-if="!part.match">{{ part.value }}</template>
              </template>
            </p>
            <p>
              <template v-for="part in latinTextParts">
                <mark v-if="part.match" :class="['ag-find-match', part.activeMatch ? 'ag-find-active-match' : '']">{{ part.value }}</mark>
                <template v-if="!part.match">{{ part.value }}</template>
              </template>
            </p>
          </div>
      </div>
    `,
    data: function () {
        return {
            imgSrc: null,
            sampleTextParts: [],
            latinTextParts: [],
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
            const originalSampleText = 'Sample Text in a Paragraph';
            const originalLatinText = getLatinText();
            const sampleTextParts = api.findGetParts({
                value: originalSampleText,
                node,
                column: null,
            });
            this.sampleTextParts = sampleTextParts.length ? sampleTextParts : [{ value: originalSampleText }];
            const precedingNumMatches = sampleTextParts.filter((part) => part.match).length;
            const latinTextParts = api.findGetParts({
                value: originalLatinText,
                node,
                column: null,
                precedingNumMatches,
            });
            this.latinTextParts = latinTextParts.length ? latinTextParts : [{ value: originalLatinText }];
        },
    },
};
