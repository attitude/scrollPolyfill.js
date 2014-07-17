/*! touchScroll.js: Scroll Polyfil for Touch Devides | Copyright (c) 2014 Martin Adamko; Licensed MIT */
window.addEventListener('load', function() {
    var lastScrollTop = document.body.scrollTop,
        simulateScroll = function() {
            // Is fire needed?
            if (lastScrollTop===document.body.scrollTop) {
                return;
            }

            // Remember last position
            lastScrollTop = document.body.scrollTop;

            // Fire scroll event
            var e = new MouseEvent('scroll', {
                    bubbles: true,
                    srcElement: document,
                    target: document
                })
                ;

            document.dispatchEvent(e);
        }
        ;

    document.body.addEventListener('touchstart', function(e) {
        simulateScroll();
    }, false);
    document.body.addEventListener('touchend', function(e) {
        simulateScroll();
    }, false);
    document.body.addEventListener('touchmove', function(e) {
        simulateScroll();
    }, false);
}, false);
