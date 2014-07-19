/*! touchScroll.js: Scroll Polyfil for Touch Devides | Copyright (c) 2014 Martin Adamko; Licensed MIT */
window.addEventListener('load', function() {
    var startPageY    = document.body.scrollTop,
        distances     = [0,0,0,0],

        scrollToStart = document.body.scrollTop,
        scrollToValue = document.body.scrollTop,
        scrollToInterval,
        scrollToTriggered  = false,
        scrollToPixelRatio = (window.devicescrollToPixelRatio || 1),
        scrollToActive     = false,
        doMomentumScroll = function () {
            // Average of (average and last distance) to put weight on last distance
            scrollToValue = document.body.scrollTop + parseInt((
                ((distances[1] + distances[2] + distances[3]) / 3 - distances[0])
                +
                distances[3]-distances[0]
            ) / 2);
        }
        ;

    document.body.addEventListener('touchstart', function(e) {
        scrollToStart  = scrollToValue = document.body.scrollTop;
        scrollToActive = true;
        startPageY     = e.pageY;
        distances      = [0,0,0,0];

        // Begin simulated scrolling just by observing value to which we need to
        // scroll to
        scrollToInterval = setInterval(function() {
            // When we reached the final value...
            if (document.body.scrollTop===scrollToValue) {
                // ...and touchend or touchcancel or scroll was triggered,
                // we can safely disable loop
                if (!scrollToActive) {
                    // Self-deactivete
                    clearInterval(scrollToInterval);
                }

                return;
            }

            // Force non-zero value
            if (scrollToValue < 0) {
                scrollToValue = 0;
            }

            // Before changing the document.body.scrollTop we need to tell
            // future scroll event, that it was triggered artificially.
            scrollToTriggered = true;

            // Scroll directions calculation
            if (scrollToValue > document.body.scrollTop) {
                document.body.scrollTop += parseInt((scrollToValue - document.body.scrollTop) / 4) + 1;
            } else {
                document.body.scrollTop -= parseInt((document.body.scrollTop - scrollToValue) / 4) + 1;
            }
        }, 50);
    }, false);

    document.body.addEventListener('touchend', function(e) {
        // We're done with moving
        scrollToActive = false;
        doMomentumScroll();
    }, false);

    document.body.addEventListener('touchcancel', function(e) {
        // We're done with moving
        scrollToActive = false;
        doMomentumScroll();
    }, false);

    // Touch move triggers simulated scroll
    document.body.addEventListener('touchmove', function(e) {
        // Prevents default scroll action
        e.preventDefault();

        // Sets value to where to scroll
        scrollToValue = scrollToStart + ((startPageY - e.pageY) * scrollToPixelRatio);

        // Set buffer of last distances for later to calculate momentum scroll
        distances[0] = distances[1];
        distances[1] = distances[2];
        distances[2] = distances[3];
        distances[3] = (startPageY - e.pageY) * scrollToPixelRatio;
    }, false);

    window.addEventListener('scroll', function(e) {
        // In case of scroll boundary bounce, stop the polyfil as on touchend or
        // touch cancel.
        if (! scrollToTriggered) {
            // Trigger self deactivation of interval
            scrollToActive = false;
            // Use navice scrolled top value to replace queue
            scrollToValue = document.body.scrollTop;
        }

        scrollToTriggered = false;
    }, false);
}, false);
