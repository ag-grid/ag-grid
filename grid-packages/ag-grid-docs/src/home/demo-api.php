<style>
.code-highlight-blue {
    color: #a3b9a3;
}

.code-highlight-yellow {
    color: #e8bf6a;
}

.code-highlight-green {
    color: #a5c261;
}

.code-highlight-purple {
    color: #977582;
}

.transition-width {
    -webkit-transition: width 3.5s;
    -moz-transition: width 3.5s;
    -o-transition: width 3.5s;
    -ms-transition: width 3.5s;
    transition: width 3.5s;
}
</style>
    <div style="background-color: rgba(44, 51, 53, 0.95);">
        <div style="padding-left: 8px; padding-top: 4px;">
            <div style="float: left; display: inline-block;">
                <div style="display: inline-block; height: 10px; margin-top: 5px; margin-right: 10px; width: 100px; border: 1px solid grey;">
                    <div id="animationCountdown" class="transition-width" style="background-color: grey; height: 100%; width: 0%;"></div>
                </div>
            </div>
            <span id="animationAction"></span>
        </div>
        <div id="animationGrid" class="ag-theme-balham-dark" style="height: 400px;"></div>
    </div>


<script src="javascript-grid-animation/animation/main.js"></script>
