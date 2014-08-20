/*! scrollPolyfill.js: Scroll Polyfil for Touch Devides | Copyright (c) 2014 Martin Adamko; Licensed MIT */
/*jslint browser: true*/
(function(window) {
/*
Todo:

mousewheel DOMMouseScroll MozMousePixelScroll
event.originalEvent.wheelDelta

*/
    var debug = false,
        consoleInfo = function() {
            if (!debug && (debug <=1 || debug==='info')) {
                return;
            }

            window.console.info(arguments);
        },
        consoleLog = function() {
            if (!debug && (debug <=2 || debug==='info')) {
                return;
            }

            window.console.log(arguments);
        },
        consoleWarn = function() {
            if (!debug && (debug <=3 || debug==='info')) {
                return;
            }

            window.console.warn(arguments);
        },
        consoleError = function() {
            if (!debug && (debug <=4 || debug==='info')) {
                return;
            }

            window.console.error(arguments);
        },
        consoleDebug = function() {
            if (!debug && (debug <=5 || debug==='info')) {
                return;
            }

            window.console.debug(arguments);
        },

        // Scroll Top where touch starts
        startPageY,
        startClientY,
        startScreenY,

        // Differences
        diffScreenY,
        diffPageY,
        diffClientY,

        // Active scroll index
        activeScrollIndex,

        // Iterator
        i,

        // Scrolling interval value
        scrollInterval,
        // Momentum acceleration
        momentumAcceleration,

        // Scroll by touch move is active
        scrollToActive = false,

        // Scroll event fired
        scrollEventFired = true,

        // More means slow-down comes later, default: 1
        coefDelta      = 1,

        // Redraw framerate...
        ticksFrameRate = 60,
        // ... translated into miliseconds
        ticksTTL = parseInt(1000 / ticksFrameRate, 10),

        // Momentum length in miliseconds
        momentumTime   = 2000,
        // ... calculated into ticks
        momentumTicks  = parseInt(momentumTime / 1000 * ticksFrameRate, 10),

        // Number of ticks since move event
        ticksSince     = 0,

        // Last move duration
        ticksSinceLast   = 0,

        // Scroll targets
        target,
        targetsY = [],
        targetsYLength = 0,

        // Scroll boundaries
        boundaryTop = 50,
        boundaryBottom = 50,

        // Old fashioned way of triggerring event (aim: cross-browser support)
        triggerScroll = function triggerScroll() {
            var e = document.createEvent('Event')
                ;

            e.initEvent('scroll', true, true);
            window.dispatchEvent(e);
        },

        // The momentum scroll
        momentumScroll = function() {
            var momentumTopValue
                ;

            if (ticksSinceLast === -1 || ticksSince-ticksSinceLast >= momentumTicks) {
                // Self deactivate
                scrollToActive = false;

                return;
            }

            activeScrollIndex = 0;

            // Calcuate sum of all moves divided by number of ticks between last move
            momentumAcceleration = diffClientY / (ticksSinceLast === 0 ? 1 : ticksSinceLast);

            consoleLog('momentumAcceleration', momentumAcceleration, 'ticksSinceLast', ticksSinceLast, 'ticksSince', ticksSince);

            // Treshhold for slow momentums

            if (Math.abs(momentumAcceleration) / (60 / ticksFrameRate) <= 2) {
                // Self deactivate
                scrollToActive = false;

                return;
            }

            consoleLog('Momentum #', ticksSince-ticksSinceLast);

            for (i=0; i<targetsYLength;i++) {
                if (activeScrollIndex != i) {
                    continue;
                }

                // Quadratic easing out
                momentumAcceleration -= momentumAcceleration * Math.pow((ticksSince/momentumTicks), coefDelta);

                consoleLog('momentumAcceleration', momentumAcceleration);

                // Help with rounding; fixes juming feel
                if (momentumAcceleration < 0) {
                    momentumAcceleration-= 0.5;
                } else {
                    momentumAcceleration+= 0.5;
                }

                momentumTopValue = parseInt(targetsY[i].scrollTopValue + momentumAcceleration, 10);

                // Top edge boundary
                if (momentumTopValue <  0) {
                    // If not already been set to go to 0...
                    if (targetsY[i].scrollTopValue !== 0) {
                        // ... set to 0...
                        targetsY[i].scrollTopValue  = 0;
                    }

                    consoleLog('Boundary: 0, level UP!');
                    activeScrollIndex++;
                } else if (momentumTopValue > targetsY[i].scrollHeightMax) {
                    // If not already set to go to the bottom edge boundary...
                    if (targetsY[i].scrollTopValue != targetsY[i].scrollHeightMax) {
                        // ...set to upper boundary...
                        targetsY[i].scrollTopValue  = targetsY[i].scrollHeightMax;
                    }

                    consoleLog('Boundary: MAX, level UP!');
                    activeScrollIndex++;
                } else {
                    targetsY[i].scrollTopValue = momentumTopValue;
                }
            }
        }
    ;

    scrollInterval = setInterval(function() {
        var did = false
            ;

        ticksSince++;

        if (!scrollToActive) {
            return;
        }

        if (scrollToActive==='end') {
            momentumScroll();
        }

        for (i=0; i<targetsYLength; i++) {
            consoleLog('++++++ scrollTops (before) @'+ticksSince+' while '+scrollToActive+' #:'+ i, targetsY[i].scrollTop, targetsY[i].scrollTopValue);

            if (targetsY[i].scrollTop === targetsY[i].scrollTopValue) {
                consoleWarn('Skipping scroll...');

                continue;
            }

            targetsY[i].scrollTop = targetsY[i].scrollTopValue;
            did = true;

            consoleLog('++++++ scrollTops (after) #:'+i, targetsY[i].scrollTop, targetsY[i].scrollTopValue);
        }

        // Trigger scroll Event for overlowed elements only; skips BODY element.
        if (targetsY[targetsYLength-1].nodeName!=='BODY' && did) {
            triggerScroll();
        }
    }, ticksTTL);

    document.body.addEventListener('touchstart', function(e) {
        var styles;

        consoleLog('Event', e.type);
        for (i=0; i < e.touches.length; i++) {
            consoleError('touch #', i, 'diffPageY:', diffPageY, 'diffClientY:', diffClientY, 'diffScreenY:', diffScreenY, 'pageY:', e.touches[i].pageY, 'clientY:', e.touches[i].clientY, 'screenY:',  e.touches[i].screenY);
        }
        // Reset ticks
        ticksSince = 0;
        ticksSinceLast  = -1;

        // Not yet... cancels previous momentum scrolling
        scrollToActive = true;

        // Target cannot be scrolled since it has no child lements, so start empty
        target         = e.target;
        targetsY       = [];
        targetsYLength = 0;

        // Walk the target parents to find possible scrollers
        while(target.parentNode !== null) {
            // Skip nodes we don't need...
            if (target.nodeName === 'HTML' || target.nodeName === '#document') {
                target = target.parentNode;

                continue;
            }

            target = target.parentNode;

            // Scrolling is not even possible
            if (target.clientHeight >= target.scrollHeight) {
                continue;
            }

            styles = getComputedStyle(target);

            if (styles !== null) {
                if (styles.overflowY && (styles.overflowY === 'scroll' || styles.overflowY === 'auto')) {
                    targetsY.push(target);
                } else if (styles.overflow === 'scroll' || styles.overflow === 'auto') {
                    // Could happen styles.overflowY is not defined? Maybe?
                    targetsY.push(target);
                } else if (target.nodeName === 'BODY') {
                    // Always add body element
                    targetsY.push(target);
                }
            }
        }

        targetsYLength = targetsY.length;

        startPageY   = e.touches[0].pageY;
        startClientY = e.touches[0].clientY;
        startScreenY = e.touches[0].screenY;

        for (i=0; i<targetsYLength; i++) {
            consoleLog('----- scrollTops (before) #:'+ i, targetsY[i].scrollTop, targetsY[i].scrollTopValue);
            // if (typeof targetsY[i].scrollTopValue !== 'number') {
            //     targetsY[i].scrollTopValue = targetsY[i].scrollTop;
            // }

            // Scroll top where to go to
            targetsY[i].scrollTopValue =
            // Scroll top where momentum scroll to go to
            targetsY[i].momentumTopValue =
            // Scroll top where previous move went to
            targetsY[i].previousMomentumTopValue =
                // Default is current position
                targetsY[i].scrollTop
            ;
            consoleLog('----- scrollTops (after) #:'+ i, targetsY[i].scrollTop, targetsY[i].scrollTopValue);
        }
    });

    document.body.addEventListener('touchmove', function(e) {
        var scrollTopValue;

        e.preventDefault();

        for (i=0; i<targetsYLength;i++) {
            consoleLog('????? scrollTops (before) #:'+ i, targetsY[i].scrollTop, targetsY[i].scrollTopValue);
        }

        if (! scrollEventFired) {
            consoleError('Skipped due: ! scrollEventFired');

            return;
        }

        if (e.changedTouches.length===0) {
            consoleLog('Skipped due: 0 changedTouches');

            return;
        }

        // Not even one tick have passed
        if (ticksSinceLast===ticksSince) {
            consoleLog('Skipped due: 0 ticksSince', e.type);

            return;
        }

        diffPageY   = startPageY   - e.touches[0].pageY;
        diffClientY = startClientY - e.touches[0].clientY;
        diffScreenY = startScreenY - e.touches[0].screenY;

        for (i=0; i < e.touches.length; i++) {
            consoleError('touch #', i, 'diffPageY:', diffPageY, 'diffClientY:', diffClientY, 'diffScreenY:', diffScreenY, 'pageY:', e.touches[i].pageY, 'clientY:', e.touches[i].clientY, 'screenY:',  e.touches[i].screenY);
        }

        if (diffScreenY === 0) {
            consoleError('Diff: 0');

            return;
        }

        // Not yet... activates scrolling
        scrollToActive = true;

        consoleError('Prevented', e.type, (parseInt((ticksSince-ticksSinceLast) / ticksTTL * 10000, 10) / 10000) + 's', e);

        // Remember ticks between last move to calculate momentum
        ticksSinceLast = ticksSince;

        activeScrollIndex = 0;

        for (i=0; i<targetsYLength;i++) {
            if (activeScrollIndex != i) {
                continue;
            }

            consoleLog('!!!!! scrollTops (before) #:'+ i, targetsY[i].scrollTop, targetsY[i].scrollTopValue, scrollTopValue);

            // Remember from previous (current) position to calculate momentum
            targetsY[i].previousMomentumTopValue = targetsY[i].momentumTopValue;

            // Calculate where we need to scroll to
            scrollTopValue =
            targetsY[i].momentumTopValue =
                diffClientY + targetsY[i].scrollTopValue
            ;

            // Calculate the maximum scrollTop
            //
            // Not using scrolHeight because of falty scrollHeight when some of
            // child elements use negative margin.
            targetsY[i].scrollHeightMax = targetsY[i].scrollHeight - targetsY[i].clientHeight;

            // Element is not heigher than its parent
            if (targetsY[i].scrollHeight <= 0) {
                // Level up!
                activeScrollIndex++;
                continue;
            }

            consoleLog(
                '#'+i,
                'Touch Y:', startScreenY, '>>>', e.touches[0].screenY,
                'now @', targetsY[i].scrollTop, 'scrollTopValue:', scrollTopValue,
                'scrollHeight:', targetsY[i].scrollHeight,
                'scrollHeightMax:', targetsY[i].scrollHeightMax,
                targetsY[i].nodeName + '#' + targetsY[i].id + '.' + targetsY[i].className.replace(/ /, '.')
            );

            // Apply scroll to:
            if (scrollTopValue <  0) {
                // If not already been set to go to 0...
                if (targetsY[i].scrollTopValue !== 0) {
                    // ... set to 0...
                    targetsY[i].scrollTopValue  = scrollTopValue = 0;

                    // ... and cancel any other scroll move
                    scrollEventFired = false;
                }

                consoleLog('Boundary: 0, level UP!');
                activeScrollIndex++;
            } else if (scrollTopValue > targetsY[i].scrollHeightMax) {
                // If not already set to go to the bottom edge boundary...
                if (targetsY[i].scrollTopValue != targetsY[i].scrollHeightMax) {
                    // ...set to upper boundary...
                    targetsY[i].scrollTopValue  = scrollTopValue = targetsY[i].scrollHeightMax;

                    // ... and cancel any other scroll move.
                    scrollEventFired = false;
                }

                consoleLog('Boundary: MAX, level UP!');
                activeScrollIndex++;
            } else {
                // Cancel any other scroll move
                scrollEventFired = false;

                targetsY[i].scrollTopValue = scrollTopValue;
            }

            consoleLog('!!!!! scrollTops (after) #:'+ i, targetsY[i].scrollTop, targetsY[i].scrollTopValue, scrollTopValue);
        }

        // Apply new relative start for next calculation
        startPageY   = e.touches[0].pageY;
        startClientY = e.touches[0].clientY;
        startScreenY = e.touches[0].screenY;

        ticksSince = 0;
    });

    document.body.addEventListener('touchend', function(e) {
        // e.preventDefault();

        // Not yet... leaves momentum scrolling
        scrollToActive = 'end';

        // Allow next scrolling as if scroll fired; Cancells throttle during touchmove
        scrollEventFired = true;

        consoleLog('Event', e.type);
    });

    document.body.addEventListener('touchcancel', function(e) {
        // e.preventDefault();

        // Not yet... cancels any scrolling
        scrollToActive = false;

        // Allow next scrolling as if scroll fired; Cancells throttle during touchmove
        scrollEventFired = true;

        consoleLog('Event', e.type);
    });

    window.addEventListener('scroll', function(e) {
        // Allow next scroll
        scrollEventFired = true;

        for (i=0; i<targetsYLength;i++) {
            consoleWarn(
                'SCROLL #', i,
                targetsY[i].nodeName + '#' + targetsY[i].id + '.' + targetsY[i].className.replace(/ /, '.'), ' .scrollTop:', targetsY[i].scrollTop
            );
        }
    }, false);
}(window));
