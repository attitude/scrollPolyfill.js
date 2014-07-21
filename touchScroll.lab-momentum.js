/*! touchScroll.js: Scroll Polyfil for Touch Devides | Copyright (c) 2014 Martin Adamko; Licensed MIT */
window.addEventListener('load', function() {
    var startPageY,
        momentumInterval,
        momentumAcceleration,

        scrollToStart = scrollToValue = momentumToValue = previousScrollToValue = document.body.scrollTop,
        scrollToTriggered  = false,
        scrollToActive     = false,

        // More means longer ease out, default: 2
        coefDelta      = 6,
        momentumTicks  = 50,

        ticksPerSecond = 50,
        ticksSince     = 0,
        ticksPerMove   = 0
        ;

    document.body.addEventListener('touchstart', function(e) {
        scrollToStart  = scrollToValue = momentumToValue = previousScrollToValue = document.body.scrollTop;
        scrollToActive = true;
        startPageY     = e.pageY;

        momentumInterval = setInterval(function() {
            ticksSince++;

            if(scrollToActive) {
                return;
            }

            if (ticksSince > momentumTicks) {
                // ...and touchend or touchcancel or scroll was triggered,
                // we can safely disable loop
                if (!scrollToActive) {
                    // Self-deactivete
                    clearInterval(momentumInterval);
                }

                return;
            }

            momentumAcceleration = (scrollToValue - previousScrollToValue) / (ticksPerMove + 1);

            // Treshhold for slow momentums
            if (Math.abs(momentumAcceleration) < 0.5 * (100 / ticksPerSecond)) {
                // Self-deactivate
                ticksSince = momentumTicks;
                return;
            }

            // Quadratic easing out
            momentumAcceleration -= momentumAcceleration * Math.pow((ticksSince/momentumTicks), coefDelta);

            // Help with rounding; fixes juming feel
            if (momentumAcceleration < 0) {
                momentumAcceleration-= 0.5;
            } else {
                momentumAcceleration+= 0.5;
            }

            momentumToValue += momentumAcceleration;

            // Top edge boundary
            if (momentumToValue < 0) {
                // Self-deactivate
                ticksSince = momentumTicks;
                return;
            }

            // Skip same values for performance
            if (document.body.scrollTop===parseInt(momentumToValue)) {
                return;
            }

            // Not a native scroll
            scrollToTriggered = true;

            document.body.scrollTop = parseInt(momentumToValue);
            // console.log(scrollToActive, 'momentum:', parseInt(momentumToValue));

            // Bottom edge boundary
            if (document.body.scrollTop != parseInt(momentumToValue)) {
                // Self-deactivate
                ticksSince = momentumTicks;
                return;
            }
        }, 1000 / ticksPerSecond);
    }, false);

    document.body.addEventListener('touchend', function(e) {
        // We're done with moving
        scrollToActive = false;
    }, false);

    document.body.addEventListener('touchcancel', function(e) {
        // We're done with moving
        scrollToActive = false;
    }, false);

    // Touch move triggers simulated scroll
    document.body.addEventListener('touchmove', function(e) {
        // Prevents default scroll action
        e.preventDefault();

        // Remember from previous position to calculate momentum
        previousScrollToValue = scrollToValue;

        // Remember ticks between last move to calculate momentum
        ticksPerMove = ticksSince;

        // Calculate where we need to scroll to
        scrollToValue = momentumToValue = startPageY - e.pageY + document.body.scrollTop;

        // Top boundary
        if (scrollToValue < 0) {
            if (scrollToStart >= 0) {
                scrollToStart += scrollToValue;
                startPageY     = e.pageY;
            }

            if (scrollToStart < 0) { scrollToStart = 0; }

            scrollToValue = previousScrollToValue = momentumToValue = startPageY - e.pageY + document.body.scrollTop;
        }

        // Not a native scroll
        scrollToTriggered = true;
        document.body.scrollTop = scrollToValue;

        // Bottom boundary (failed to scroll)
        if (scrollToValue > document.body.scrollTop) {
            startPageY = e.pageY;
            scrollToStart += document.body.scrollTop - scrollToValue;
            scrollToValue = momentumToValue = document.body.scrollTop;
        }

        ticksSince = 0;
    }, false);

    window.addEventListener('scroll', function(e) {
        // In case of scroll boundary bounce, stop the polyfil as on touchend or
        // touch cancel.
        if (! scrollToTriggered) {
            // Trigger self deactivation of interval
            scrollToActive = false;
        }

        scrollToTriggered = false;
    }, false);
}, false);
