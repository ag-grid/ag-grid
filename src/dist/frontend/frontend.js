/* mobile menu */
var navToggle = document.getElementById('nav-toggle');
var navCollapse = document.getElementsByClassName('navbar-collapse');

var toggleClass = function() {
    console.log('Open Menu.');
    navToggle.classList.toggle('open');
    navCollapse[0].classList.toggle('collapse');
};

navToggle.addEventListener('click', toggleClass, false);