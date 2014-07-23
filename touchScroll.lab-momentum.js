/*! touchScroll.js: Scroll Polyfil for Touch Devides | Copyright (c) 2014 Martin Adamko; Licensed MIT */
window.addEventListener('load', function() {
    var // Scroll Top where touch starts
        startClientY,

        // Momentum animation interval value
        momentumInterval,
        // Momentum acceleration
        momentumAcceleration,

        // Artificial scroll event
        scrollToTriggered  = false,

        // Scroll by touch move is active
        scrollToActive     = false,

        // More means slow-down comes later, default: 1
        coefDelta      = 1,

        // More means longer momentum scroll, default: 50
        momentumTicks  = 50,

        // Redraw speed; default: 50 ~ 25fps
        ticksPerSecond = 50,

        // Number of ticks since move event
        ticksSince     = 0,

        // Last move duration
        ticksPerMove   = 0,

        // Scroll targets
        targetsY = [],
        targetsYLength = 0,

        // Scroll boundaries
        boundaryTop = 50,
        boundaryBottom = 50
        ;

    document.body.addEventListener('touchstart', function(e) {
        var target = e.target,
            styles = getComputedStyle(target),
            i
            ;

        scrollToActive = true;
        targetsY       = styles.overflow != 'hidden' && styles.overflowY != 'hidden' ? [e.target] : [];

        while(target.parentNode != null) {
            target = target.parentNode;

            // Skip nodes we don't need...
            if (target.nodeName === 'HTML' || target.nodeName === '#document') {
                continue;
            }

            // ...but, let's asume things go wrong
            try {
                styles = getComputedStyle(target);

                if (styles != null) {
                    if (styles.overflow != 'hidden' && styles.overflowY !== 'hidden') {
                        targetsY.push(target);
                    }
                }
            } catch(exception) {
                console.log(target);
            }
        }

        targetsYLength = targetsY.length;

        startClientY = e.touches[0].clientY;

        for (i=0; i<targetsYLength; i++) {
            // Scroll top where to go to
            targetsY[i].scrollToValue =
            // Scroll top where momentum scroll to go to
            targetsY[i].momentumToValue =
            // Scroll top where previous move went to
            targetsY[i].previousScrollToValue =
                // Default is current position
                targetsY[i].scrollTop
            ;
        }

        // Start interval
        momentumInterval = setInterval(function() {
            var i,
                activeScrollIndex
                ;

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
                    momentumInterval = null;
                }

                return;
            }

            activeScrollIndex = momentumAcceleration = 0;

            // Calcuate sum of all moves divided by number of ticks between last move
            for (i=0; i<targetsYLength;i++) {
                momentumAcceleration += (targetsY[i].scrollToValue - targetsY[i].previousScrollToValue) / (ticksPerMove + 1);
            }

            // Treshhold for slow momentums
            if (Math.abs(momentumAcceleration) < 0.5 / (100 / ticksPerSecond)) {
                // Self-deactivate
                ticksSince = momentumTicks;
                return;
            }

            for (i=0; i<targetsYLength;i++) {
                if (activeScrollIndex != i) {
                    continue;
                }

                // Quadratic easing out
                momentumAcceleration -= momentumAcceleration * Math.pow((ticksSince/momentumTicks), coefDelta);

                // Help with rounding; fixes juming feel
                if (momentumAcceleration < 0) {
                    momentumAcceleration-= 0.5;
                } else {
                    momentumAcceleration+= 0.5;
                }

                targetsY[i].momentumToValue += momentumAcceleration;

                // Top edge boundary
                if (targetsY[i].momentumToValue < 0) {
                    activeScrollIndex++;

                    continue;
                }

                // Skip same values for performance
                if (targetsY[i].scrollTop===parseInt(targetsY[i].momentumToValue)) {
                    return;
                }

                // Not a native scroll
                scrollToTriggered = true;

                targetsY[i].scrollTop = parseInt(targetsY[i].momentumToValue);

                // Bottom edge boundary
                if (targetsY[i].scrollTop != parseInt(targetsY[i].momentumToValue)) {
                    activeScrollIndex++;

                    continue;
                }
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
        var i,
            activeScrollIndex
            ;

        // Prevents default scroll action
        e.preventDefault();

        // Remember ticks between last move to calculate momentum
        ticksPerMove = ticksSince;

        // Not a native scroll
        scrollToTriggered = true;

        activeScrollIndex = 0;

        for (i=0; i<targetsYLength;i++) {
            if (activeScrollIndex != i) {
                continue;
            }

            // Remember from previous (current) position to calculate momentum
            targetsY[i].previousScrollToValue = targetsY[i].scrollTop;

            // Calculate where we need to scroll to
            targetsY[i].scrollToValue   =
            targetsY[i].momentumToValue =
                startClientY - e.touches[0].clientY + targetsY[i].scrollTop
            ;

            // console.log('#'+i, 'Touch Y:', startClientY, '>', e.touches[0].clientY, 'scrollToValue:', targetsY[i].scrollToValue, '@', targetsY[i].scrollTop);

            // Apply scroll
            targetsY[i].scrollTop = targetsY[i].scrollToValue;

            // console.log('now @', targetsY[i].scrollTop);

            // Failed to apply on boundaries
            if (targetsY[i].scrollToValue !== targetsY[i].scrollTop) {
                activeScrollIndex++;
            }
        }

        // Apply new relative start for next calculation
        startClientY = e.touches[0].clientY;

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
