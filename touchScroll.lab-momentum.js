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
        targetsYLength = 0
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
            if (target.nodeName == 'HTML') {
                continue;
            }

            styles = getComputedStyle(target);

            if (styles != null) {
                if (styles.overflow != 'hidden' && styles.overflowY !== 'hidden') {
                    targetsY.push(target);
                }
            }
        }

        targetsYLength = targetsY.length;

        // Scroll Top where touch starts
        startClientY = e.touches[0].clientY;

        for (i=0; i<targetsYLength; i++) {
            // Scroll top when move started
            targetsY[i].scrollToStart =
                // Scroll top where to go to
                targetsY[i].scrollToValue =
                // Scroll top where momentum scroll to go to
                targetsY[i].momentumToValue =
                // Scroll top where previous move went to
                targetsY[i].scrollToValue =
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
                }

                return;
            }

            activeScrollIndex = 0;

            for (i=0; i<targetsYLength;i++) {
                if (activeScrollIndex != i) {
                    continue;
                }

                momentumAcceleration = (targetsY[i].scrollToValue - targetsY[i].previousScrollToValue) / (ticksPerMove + 1);

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

            // Remember from previous position to calculate momentum
            targetsY[i].previousScrollToValue = targetsY[i].scrollToValue;

            // Calculate where we need to scroll to
            targetsY[i].scrollToValue = targetsY[i].momentumToValue = startClientY - e.touches[0].clientY + targetsY[i].scrollToStart;

            // Top boundary
            if (targetsY[i].scrollToValue < 0) {
                if (targetsY[i].nodeName==='BODY') {
                    if (targetsY[i].scrollToStart >= 0) {
                        targetsY[i].scrollToStart += targetsY[i].scrollToValue;
                        startClientY     = e.touches[0].clientY;
                    }

                    if (targetsY[i].scrollToStart < 0) { targetsY[i].scrollToStart = 0; }

                    // Calculate where we need to scroll to
                    targetsY[i].previousScrollToValue = targetsY[i].scrollToValue = targetsY[i].momentumToValue = startClientY - e.touches[0].clientY + targetsY[i].scrollTop;
                }

                activeScrollIndex++; // Force to allow next target
            }

            // Apply scroll
            targetsY[i].scrollTop = targetsY[i].scrollToValue;

            // Bottom boundary (failed to scroll)
            if (targetsY[i].scrollToValue > targetsY[i].scrollTop) {
                if (targetsY[i].nodeName==='BODY') {
                    startClientY-= targetsY[i].scrollToValue - targetsY[i].scrollTop;
                    targetsY[i].scrollToValue = targetsY[i].momentumToValue = targetsY[i].scrollTop;
                }

                activeScrollIndex++; // Force to allow next target
            }

            // console.log('#'+i, 'Touch Y:', startClientY, '>', e.touches[0].clientY, 'scrollToStart:', targetsY[i].scrollToStart, 'scrollToValue:', targetsY[i].scrollToValue, '@', targetsY[i].scrollTop);
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
