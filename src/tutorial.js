fetch("feature-overlays.json")
    .then(response => response.json())
    .then(data => {
        const Empty = { template: "" };
        const Bar = {
            template: `
    <div>
    <div id="markers">

	<div v-for="marker in markers" v-bind:style="arrowStyle(marker.selector, marker.type)" v-bind:class="markerClass(marker.type)">⬆</div>
    <!--
         <svg id="mySVG" width="100vw" height="100vh" style="position: fixed; top: 0; left: 0; z-index: 1; pointer-events: none; width: 100vw; height: 100vh">
            <defs>
                <mask id="myMask" x="0" y="0" width="100%" height="100%" >
                    <rect width="100%" height="100%" fill="white"/>
                    <rect v-for="marker in markers" v-bind:x="markerStyle(marker).x" v-bind:y="markerStyle(marker).y" v-bind:width="markerStyle(marker).width" v-bind:height="markerStyle(marker).height" fill="black" rx="50%"/>
                </mask>
            </defs>

            <rect x="0" y="0" width="100%" height="100%" fill="rgba(255, 255, 255, 0.5)" mask="url(#myMask)"></rect>
        </svg>
        -->
    </div>
    <div class="modal fade show" tabindex="-1" role="dialog" style="display: block; pointer-events: none">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <select v-model="currentSectionUrl">
                    <option v-for="section in sections" v-bind:value="section.url">{{section.title}}</option>
                </select>

                <router-link to="/" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></router-link>

              </div>
              <div class="modal-body">
                <h3 v-html="title"></h3>
                <p v-html="content"></p>
              </div>

              <div class="modal-footer">
                <router-link v-bind:to="prevSlide" class="btn btn-secondary" v-if="showPrevSlide">Previous</router-link>
                <router-link v-bind:to="nextSlide" class="btn btn-primary" v-if="showNextSlide">Next</router-link>
              </div>
            </div>
          </div>
        </div>
    </div>
    `,
            methods: {
                markerClass: function(type) {
                    if (type == "oval") {
                        return "oval";
                    } else {
                        return "arrow";
                    }
                },

                arrowStyle: function(selector, type) {
                    try {
                        var rect = document.querySelector(selector).getBoundingClientRect();
                        var rect = document.querySelector(selector).getBoundingClientRect();
                        var padding = 20;

                        if (type == "oval") {
                            return {
                                top: rect.top - padding + "px",
                                left: rect.left - padding + "px",
                                position: "fixed",
                                textIndent: "-20000px",
                                overflow: "hidden",
                                boxShadow: "rgba(255, 0, 0, 0.8) 0 0 0px 7px",
                                borderRadius: "3px",
                                zIndex: 20,
                                width: rect.width + padding * 2 + "px",
                                height: rect.height + padding * 2 + "px",
                                pointerEvents: "none"
                            };
                        } else {
                            return {
                                top: rect.top + rect.height / 2 - 12 + "px",
                                left: rect.left + rect.width / 2 - 24 + "px",
                                position: "fixed",
                                fontSize: "48px",
                                color: "red",
                                zIndex: 20,
                                pointerEvents: "none"
                                /*
                        x: rect.left - padding + "px",
                        width: rect.width + padding * 2 + "px",
                        height: rect.height + padding * 2 + "px",
                        */
                            };
                        }
                    } catch {
                        console.error(`Can't find ${selector}`);
                        return {
                            display: "none"
                        };
                    }
                },

                markerStyle: function(selector) {
                    try {
                        var rect = document.querySelector(selector).getBoundingClientRect();
                        var padding = 20;

                        return {
                            y: rect.top - padding + "px",
                            x: rect.left - padding + "px",
                            width: rect.width + padding * 2 + "px",
                            height: rect.height + padding * 2 + "px"
                        };
                    } catch {
                        console.error(`Can't find ${selector}`);
                    }
                }
            },
            computed: {
                currentSectionImage: function() {
                    return this.currentSection.img;
                },

                currentSectionUrl: {
                    get: function() {
                        return this.currentSection.url;
                    },
                    set: function(value) {
                        router.push(`/${value}/1`);
                    }
                },

                currentSection: function() {
                    return data.find(item => item.url == this.$route.params.section);
                },

                sections: function() {
                    return data;
                },

                currentSlide: function() {
                    return this.$route.params.slide - 1;
                },

                content: function() {
                    return this.currentSection.slides[this.currentSlide].content;
                },

                markers: function() {
                    return this.currentSection.slides[this.currentSlide].markers;
                },

                title: function() {
                    return `${this.currentSection.title}${this.currentSection.slides.length == 1 ? "" : ` (${this.currentSlide + 1}/${this.currentSection.slides.length})`}`;
                },

                showNextSlide: function() {
                    if (data.indexOf(this.currentSection) < data.length - 1) {
                        return true;
                    } else {
                        return this.currentSlide < this.currentSection.slides.length - 1;
                    }
                },

                showPrevSlide: function() {
                    if (data.indexOf(this.currentSection) > 0) {
                        return true;
                    } else {
                        return this.currentSlide > 0;
                    }
                },

                prevSlide: function() {
                    if (this.currentSlide == 0) {
                        const currentSectionIndex = data.indexOf(this.currentSection);
                        const prevSection = data[currentSectionIndex - 1];
                        if (prevSection) {
                            return `/${prevSection.url}/${prevSection.slides.length}`;
                        } else {
                            return "";
                        }
                    } else {
                        return `/${this.currentSection.url}/${this.currentSlide}`;
                    }
                },

                nextSlide: function() {
                    if (this.currentSection.slides.length - 1 == this.currentSlide) {
                        const currentSectionIndex = data.indexOf(this.currentSection);
                        const nextSection = data[currentSectionIndex + 1];
                        if (nextSection) {
                            return `/${nextSection.url}/1`;
                        } else {
                            return "";
                        }
                    } else {
                        return `/${this.currentSection.url}/${this.currentSlide + 2}`;
                    }
                }
            }
        };

        const routes = [{ path: "/", component: {} }, { path: "/:section/:slide", component: Bar }];

        const router = new VueRouter({
            base: "/tutorial.html",
            onReady: function() {
                debugger;
            },
            routes // short for `routes: routes`
        });

        setTimeout(function() {
            var app = new Vue({
                router,
                methods: {
                    toggleTutorial: () => {
                        if (router.currentRoute.path == "/") {
                            router.push("/performance/1");
                        } else {
                            router.push("/");
                        }
                    }
                }
            }).$mount("#features-overlay");
        }, 1300);
    });
