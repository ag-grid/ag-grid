/**
@license @nocompile
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
(function(){/*

 Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
'use strict';(function(h){function B(a,b){if("function"===typeof window.CustomEvent)return new CustomEvent(a,b);var c=document.createEvent("CustomEvent");c.initCustomEvent(a,!!b.bubbles,!!b.cancelable,b.detail);return c}function n(a){if(w)return a.ownerDocument!==document?a.ownerDocument:null;var b=a.__importDoc;if(!b&&a.parentNode){b=a.parentNode;if("function"===typeof b.closest)b=b.closest("link[rel=import]");else for(;!r(b)&&(b=b.parentNode););a.__importDoc=b}return b}function L(a){var b=l(document,
"link[rel=import]:not([import-dependency])"),c=b.length;c?g(b,function(b){return t(b,function(){0===--c&&a()})}):a()}function C(a){function b(){"loading"!==document.readyState&&document.body&&(document.removeEventListener("readystatechange",b),a())}document.addEventListener("readystatechange",b);b()}function D(a){C(function(){return L(function(){return a&&a()})})}function t(a,b){if(a.__loaded)b&&b();else if("script"===a.localName&&!a.src||"style"===a.localName&&!a.firstChild)a.__loaded=!0,b&&b();
else{var c=function(d){a.removeEventListener(d.type,c);a.__loaded=!0;b&&b()};a.addEventListener("load",c);x&&"style"===a.localName||a.addEventListener("error",c)}}function r(a){return a.nodeType===Node.ELEMENT_NODE&&"link"===a.localName&&"import"===a.rel}function k(){var a=this;this.a={};this.b=0;this.g=new MutationObserver(function(b){return a.A(b)});this.g.observe(document.head,{childList:!0,subtree:!0});this.loadImports(document)}function E(a){g(l(a,"template"),function(a){g(l(a.content,'script:not([type]),script[type="application/javascript"],script[type="text/javascript"],script[type="module"]'),
function(a){var b=document.createElement("script");g(a.attributes,function(a){return b.setAttribute(a.name,a.value)});b.textContent=a.textContent;a.parentNode.replaceChild(b,a)});E(a.content)})}function l(a,b){return a.childNodes.length?a.querySelectorAll(b):M}function g(a,b,c){var d=a?a.length:0,f=c?-1:1;for(c=c?d-1:0;c<d&&0<=c;c+=f)b(a[c],c)}var p=document.createElement("link"),w="import"in p,M=p.querySelectorAll("*"),y=null;!1==="currentScript"in document&&Object.defineProperty(document,"currentScript",
{get:function(){return y||("complete"!==document.readyState?document.scripts[document.scripts.length-1]:null)},configurable:!0});var N=/(url\()([^)]*)(\))/g,O=/(@import[\s]+(?!url\())([^;]*)(;)/g,P=/(<link[^>]*)(rel=['|"]?stylesheet['|"]?[^>]*>)/g,e={v:function(a,b){a.href&&a.setAttribute("href",e.c(a.getAttribute("href"),b));a.src&&a.setAttribute("src",e.c(a.getAttribute("src"),b));if("style"===a.localName){var c=e.o(a.textContent,b,N);a.textContent=e.o(c,b,O)}},o:function(a,b,c){return a.replace(c,
function(a,c,m,g){a=m.replace(/["']/g,"");b&&(a=e.c(a,b));return c+"'"+a+"'"+g})},c:function(a,b){if(void 0===e.f){e.f=!1;try{var c=new URL("b","http://a");c.pathname="c%20d";e.f="http://a/c%20d"===c.href}catch(d){}}if(e.f)return(new URL(a,b)).href;c=e.s;c||(c=document.implementation.createHTMLDocument("temp"),e.s=c,c.i=c.createElement("base"),c.head.appendChild(c.i),c.h=c.createElement("a"));c.i.href=b;c.h.href=a;return c.h.href||a}},F={async:!0,load:function(a,b,c){if(a)if(a.match(/^data:/)){a=
a.split(",");var d=a[1];d=-1<a[0].indexOf(";base64")?atob(d):decodeURIComponent(d);b(d)}else{var f=new XMLHttpRequest;f.open("GET",a,F.async);f.onload=function(){var a=f.responseURL||f.getResponseHeader("Location");a&&0===a.indexOf("/")&&(a=(location.origin||location.protocol+"//"+location.host)+a);var d=f.response||f.responseText;304===f.status||0===f.status||200<=f.status&&300>f.status?b(d,a):c(d)};f.send()}else c("error: href must be specified")}},x=/Trident/.test(navigator.userAgent)||/Edge\/\d./i.test(navigator.userAgent);
k.prototype.loadImports=function(a){var b=this;g(l(a,"link[rel=import]"),function(a){return b.l(a)})};k.prototype.l=function(a){var b=this,c=a.href;if(void 0!==this.a[c]){var d=this.a[c];d&&d.__loaded&&(a.__import=d,this.j(a))}else this.b++,this.a[c]="pending",F.load(c,function(a,d){a=b.B(a,d||c);b.a[c]=a;b.b--;b.loadImports(a);b.m()},function(){b.a[c]=null;b.b--;b.m()})};k.prototype.B=function(a,b){if(!a)return document.createDocumentFragment();x&&(a=a.replace(P,function(a,b,c){return-1===a.indexOf("type=")?
b+" type=import-disable "+c:a}));var c=document.createElement("template");c.innerHTML=a;if(c.content)a=c.content,E(a);else for(a=document.createDocumentFragment();c.firstChild;)a.appendChild(c.firstChild);if(c=a.querySelector("base"))b=e.c(c.getAttribute("href"),b),c.removeAttribute("href");var d=0;g(l(a,'link[rel=import],link[rel=stylesheet][href][type=import-disable],style:not([type]),link[rel=stylesheet][href]:not([type]),script:not([type]),script[type="application/javascript"],script[type="text/javascript"],script[type="module"]'),
function(a){t(a);e.v(a,b);a.setAttribute("import-dependency","");if("script"===a.localName&&!a.src&&a.textContent){if("module"===a.type)throw Error("Inline module scripts are not supported in HTML Imports.");a.setAttribute("src","data:text/javascript;charset=utf-8,"+encodeURIComponent(a.textContent+("\n//# sourceURL="+b+(d?"-"+d:"")+".js\n")));a.textContent="";d++}});return a};k.prototype.m=function(){var a=this;if(!this.b){this.g.disconnect();this.flatten(document);var b=!1,c=!1,d=function(){c&&
b&&(a.loadImports(document),a.b||(a.g.observe(document.head,{childList:!0,subtree:!0}),a.w()))};this.D(function(){c=!0;d()});this.C(function(){b=!0;d()})}};k.prototype.flatten=function(a){var b=this;g(l(a,"link[rel=import]"),function(a){var c=b.a[a.href];(a.__import=c)&&c.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&(b.a[a.href]=a,a.readyState="loading",a.__import=a,b.flatten(c),a.appendChild(c))})};k.prototype.C=function(a){function b(f){if(f<d){var m=c[f],e=document.createElement("script");m.removeAttribute("import-dependency");
g(m.attributes,function(a){return e.setAttribute(a.name,a.value)});y=e;m.parentNode.replaceChild(e,m);t(e,function(){y=null;b(f+1)})}else a()}var c=l(document,"script[import-dependency]"),d=c.length;b(0)};k.prototype.D=function(a){var b=l(document,"style[import-dependency],link[rel=stylesheet][import-dependency]"),c=b.length;if(c){var d=x&&!!document.querySelector("link[rel=stylesheet][href][type=import-disable]");g(b,function(b){t(b,function(){b.removeAttribute("import-dependency");0===--c&&a()});
if(d&&b.parentNode!==document.head){var e=document.createElement(b.localName);e.__appliedElement=b;e.setAttribute("type","import-placeholder");b.parentNode.insertBefore(e,b.nextSibling);for(e=n(b);e&&n(e);)e=n(e);e.parentNode!==document.head&&(e=null);document.head.insertBefore(b,e);b.removeAttribute("type")}})}else a()};k.prototype.w=function(){var a=this;g(l(document,"link[rel=import]"),function(b){return a.j(b)},!0)};k.prototype.j=function(a){a.__loaded||(a.__loaded=!0,a.import&&(a.import.readyState=
"complete"),a.dispatchEvent(B(a.import?"load":"error",{bubbles:!1,cancelable:!1,detail:void 0})))};k.prototype.A=function(a){var b=this;g(a,function(a){return g(a.addedNodes,function(a){a&&a.nodeType===Node.ELEMENT_NODE&&(r(a)?b.l(a):b.loadImports(a))})})};var z=null;if(w)g(l(document,"link[rel=import]"),function(a){a.import&&"loading"===a.import.readyState||(a.__loaded=!0)}),p=function(a){a=a.target;r(a)&&(a.__loaded=!0)},document.addEventListener("load",p,!0),document.addEventListener("error",p,
!0);else{var q=Object.getOwnPropertyDescriptor(Node.prototype,"baseURI");Object.defineProperty((!q||q.configurable?Node:Element).prototype,"baseURI",{get:function(){var a=r(this)?this:n(this);return a?a.href:q&&q.get?q.get.call(this):(document.querySelector("base")||window.location).href},configurable:!0,enumerable:!0});Object.defineProperty(HTMLLinkElement.prototype,"import",{get:function(){return this.__import||null},configurable:!0,enumerable:!0});C(function(){z=new k})}D(function(){return document.dispatchEvent(B("HTMLImportsLoaded",
{cancelable:!0,bubbles:!0,detail:void 0}))});h.useNative=w;h.whenReady=D;h.importForElement=n;h.loadImports=function(a){z&&z.loadImports(a)}})(window.HTMLImports=window.HTMLImports||{});/*

 Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
var u=window.customElements,v=window.HTMLImports,A=window.HTMLTemplateElement;window.WebComponents=window.WebComponents||{};if(u&&u.polyfillWrapFlushCallback){var G,H=function(){if(G){A.u&&A.u(window.document);var h=G;G=null;h();return!0}},I=v.whenReady;u.polyfillWrapFlushCallback(function(h){G=h;I(H)});v.whenReady=function(h){I(function(){H()?v.whenReady(h):h()})}}
v.whenReady(function(){requestAnimationFrame(function(){window.WebComponents.ready=!0;document.dispatchEvent(new CustomEvent("WebComponentsReady",{bubbles:!0}))})});var J=document.createElement("style");J.textContent="body {transition: opacity ease-in 0.2s; } \nbody[unresolved] {opacity: 0; display: block; overflow: hidden; position: relative; } \n";var K=document.querySelector("head");K.insertBefore(J,K.firstChild);/*

Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
}).call(this);

//# sourceMappingURL=webcomponents-hi.js.map
