/*
 * <expanding-section> custom element. Externalised from an inline <script> so the
 * site Content-Security-Policy can drop script-src 'unsafe-inline'. Static, served
 * from 'self'. The define guard makes it safe to include once per instance.
 */
(function () {
    if (customElements.get('expanding-section')) {
        return;
    }

    var clamp = function (num, min, max) {
        return Math.max(min, Math.min(num, max));
    };

    // Reading offsetHeight flushes pending CSS changes (forces a synchronous reflow).
    var forceReflow = function (el) {
        return el.offsetHeight;
    };

    class ExpandingSection extends HTMLElement {
        #isOpen = false;
        #details;
        #summary;
        #chevron;
        #contentOuter;
        #contentInner;

        constructor() {
            super();

            this.#details = this.querySelector('details');
            this.#summary = this.querySelector('summary');
            this.#chevron = this.querySelector('svg');
            this.#contentOuter = this.querySelector('.es-content-outer');
            this.#contentInner = this.querySelector('.es-content-inner');

            this.#summary.addEventListener('click', this.#clickHandler.bind(this));

            this.#contentOuter.addEventListener('transitionend', () => {
                if (this.isOpen) {
                    this.#setCSSProp('--content-height', 'none');
                } else {
                    this.#details.removeAttribute('open');
                }
            });
        }

        get isOpen() {
            return this.#isOpen;
        }

        set isOpen(v) {
            this.#isOpen = v === true;

            if (this.#isOpen) {
                this.#open();
            } else {
                this.#close();
            }
        }

        connectedCallback() {
            const hash = window.location.hash;
            const hasHashId = hash ? this.#contentInner.querySelector(hash) : undefined;
            const isOpen = hasHashId || this.#details.getAttribute('open') !== null;

            if (isOpen) {
                const noAnimation = true;
                this.#open(noAnimation);
                this.isOpen = true;
            }

            if (hasHashId) {
                // Wait a little bit before scrolling into view
                setTimeout(() => {
                    hasHashId.scrollIntoView(true);
                }, 100);
            }
        }

        get #contentHeight() {
            return this.#contentInner.offsetHeight;
        }

        #clickHandler(event) {
            event.preventDefault();

            this.isOpen = !this.isOpen;
        }

        #setCSSProp(propertyName, value) {
            this.#details.style.setProperty(propertyName, value);
        }

        #open(noAnimation = false) {
            const contentHeight = this.#contentHeight;
            const transitionTiming = noAnimation ? 0 : clamp(contentHeight / 2500, 0.25, 1);

            this.#details.setAttribute('open', '');
            this.#chevron.classList.add('is-open');

            forceReflow(document.documentElement); // Trigger a reflow, flushing the CSS changes
            this.#setCSSProp('--content-transition-timing', `${transitionTiming}s`);
            this.#setCSSProp('--content-height', `${contentHeight + 2}px`);
        }

        #close() {
            const summaryRect = this.#summary.getBoundingClientRect();
            const distanceFromBottom = window.innerHeight - summaryRect.bottom;
            const isLargeContent = this.#contentHeight > distanceFromBottom;
            const contentHeight = isLargeContent ? distanceFromBottom : this.#contentHeight;

            if (isLargeContent) {
                // Set content to be less than the content viewport
                this.#setCSSProp('--content-transition-timing', `0s`);
                this.#setCSSProp('--content-height', `${contentHeight + 2}px`);
            }

            const transitionTiming = clamp(contentHeight / 2500, 0.25, 1);

            this.#chevron.classList.remove('is-open');

            // Set a specific height, as you can't transition from `max-height: none`
            this.#setCSSProp('--content-height', `${contentHeight + 2}px`);
            forceReflow(document.documentElement); // Trigger a reflow, flushing the CSS changes

            this.#setCSSProp('--content-transition-timing', `${transitionTiming}s`);
            this.#setCSSProp('--content-height', `0px`);
        }
    }

    customElements.define('expanding-section', ExpandingSection);
})();
