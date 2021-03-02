---
title: "AG Grid Packages & Modules"
---

Version 22.0.0 changes the way AG Grid is made available by providing functionality in modules, allowing you to pick and choose which features you require, resulting in a smaller application size overall.

## Introduction

There are two main ways to install AG Grid - either by using `packages` , or by using `modules`. [packages](/packages/) are the easiest way to use AG Grid, but by default include all code specific to each package, whereas [modules](/modules/) allow you to cherry pick what functionality you want, which will allow for a reduced overall bundle size.

If you're unsure whether to use `packages` or `modules` then we'd recommend starting with `packages` and migrate to `modules` if you wish to reduce overall bundle size.


<div class="d-flex justify-content-around" style="height: 20rem;">
    <div class="d-flex flex-column" style="max-width: 20rem; min-width: 10rem; height: 20rem; border: 1px solid lightgray; border-radius: 5px; overflow: hidden;">
        <div class="flex-grow-1 d-flex justify-content-center p-4" style="background-color: #fffaf0;">
            <a class="d-flex align-items-center" href="../packages/"><img src="resources/packages.svg" style="width: 100%; max-width: 6rem;" alt="Grid Packages Overview" /></a>
        </div>
        <div class="p-2" style="border-top: 1px solid lightgray; background-color: #f8f9fa; text-align: center;">
            <p class="mb-0 btn btn-primary"><a href="../packages/" style="color: white">Packages Overview</a></p>
        </div>
    </div>
    <div class="d-flex flex-column" style="max-width: 20rem; min-width: 10rem; height: 20rem; border: 1px solid lightgray; border-radius: 5px; overflow: hidden;">
        <div class="flex-grow-1 d-flex justify-content-center p-4" style="background-color: #fffaf0;">
            <a class="d-flex align-items-center" href="../modules/"><img src="resources/modules.svg" style="width: 100%; max-width: 6rem;" alt="Grid Modules Overview"/></a>
        </div>
        <div class="p-2" style="border-top: 1px solid lightgray; background-color: #f8f9fa; text-align: center;">
            <p class="mb-0 btn btn-primary"><a href="../modules/" style="color: white">Modules Overview</a></p>
        </div>
    </div>
</div>