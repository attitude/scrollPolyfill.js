/*! scrollPolyfillLite.js: Scroll Polyfil for Touch Devides | Copyright (c) 2014 Martin Adamko; Licensed MIT */
/*jslint browser: true*/
(function(window, console) {
    var debug = false,
        consoleClear = function() {
            if (debug) {
                console.clear();
            }
        },
        consoleInfo = function() {
            if (!debug && (debug <= 1 || debug === 'info')) {
                return;
            }

            console.info(arguments);
        },
        consoleLog = function() {
            if (!debug && (debug <= 2 || debug === 'info')) {
                return;
            }

            console.log(arguments);
        },
        consoleWarn = function() {
            if (!debug && (debug <= 3 || debug === 'info')) {
                return;
            }

            console.warn(arguments);
        },
        consoleError = function() {
            if (!debug && (debug <= 4 || debug === 'info')) {
                return;
            }

            console.error(arguments);
        },
        consoleDebug = function() {
            if (!debug && (debug <= 5 || debug === 'info')) {
                return;
            }

            console.debug(arguments);
        },

        // Iterator
        i,

        // Scrolling interval value
        scrollInterval,

        // Scroll by touch move is active
        scrollToActive = false,

        // Scroll event fired
        scrollEventFired = true,

        // Redraw framerate...
        ticksFrameRate = 25,
        // ... translated into miliseconds
        ticksTTL = parseInt(1000 / ticksFrameRate, 10),

        // Number of ticks since move event
        ticksSince = 0,

        // Last move duration
        ticksSinceLast = 0,

        // Scroll targets
        target,
        // Scrollers
        scrollTargets = [],
        scrollTargetsLength = 0,

        // isMobileSafari = !! window.navigator.userAgent.match(/iP(hone|ad|od)/),
        rxaosp = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d]+)/),
        isAndroidBrowser = (rxaosp && rxaosp[1] < 537),

        // Old fashioned way of triggerring event (aim: cross-browser support)
        // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
        _triggerScroll = function _triggerScroll() {
            var e = document.createEvent('Event');

            e.initEvent('scroll', true, true);
            window.dispatchEvent(e);
        },

        triggerScroll = function triggerScroll() {
            if (isAndroidBrowser) {
                window.requestAnimationFrame(_triggerScroll);
            } else {
                _triggerScroll();
            }
        },

        lastPositions = function() {
            for (i = 0; i < scrollTargetsLength; i++) {
                consoleWarn('Update #', i, scrollTargets[i].scrollTop, scrollTargets[i].scrollLeft);

                scrollTargets[i].scrollTopLast = scrollTargets[i].scrollTop;
                scrollTargets[i].scrollLeftLast = scrollTargets[i].scrollLeft;
            }
        };

    scrollInterval = setInterval(function() {
        var did = false;

        ticksSince++;

        if (!scrollToActive) {
            return;
        }

        for (i = 0; i < scrollTargetsLength; i++) {
            // Already found some
            if (did) {
                break;
            }

            // Vertical change happened
            if (scrollTargets[i].scrollTop !== scrollTargets[i].scrollTopLast) {
                did = true;
            }

            // Horizontal change happened
            if (scrollTargets[i].scrollLeft !== scrollTargets[i].scrollLeftLast) {
                did = true;
            }
        }

        // Trigger scroll Event for overlowed elements only; skips BODY element, which is triggered automatically.
        if (did) {
            triggerScroll();
        }
    }, ticksTTL);

    document.body.addEventListener('touchstart', function(e) {
        var styles;

        consoleClear();
        consoleLog('Event', e.type);

        // Reset ticks
        ticksSince = 0;
        ticksSinceLast = -1;

        // Not yet... cancels previous actions
        scrollToActive = true;

        // Target cannot be scrolled since it has no child lements, so start empty
        target = e.target;
        scrollTargets = [];
        scrollTargetsLength = 0;

        // Walk the target parents to find possible scrollers
        while (target.parentNode !== null) {
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
                    // Vertical scrollers
                    scrollTargets.push(target);
                } else if (styles.overflowX && (styles.overflowX === 'scroll' || styles.overflowX === 'auto')) {
                    // Horizontal scrollers
                    scrollTargets.push(target);
                } else if (styles.overflow === 'scroll' || styles.overflow === 'auto') {
                    // Fallback: Could happen styles.overflowY is not defined? Maybe?
                    scrollTargets.push(target);
                } else if (target.nodeName === 'BODY') {
                    // Always add body element
                    scrollTargets.push(target);
                }
            }
        }

        // Cache size
        scrollTargetsLength = scrollTargets.length;

        // Walk to remember last positions
        lastPositions();
    });

    document.body.addEventListener('touchmove', function(e) {
        // e.preventDefault();
        triggerScroll();

        if (!scrollEventFired) {
            consoleError('Skipped due: ! scrollEventFired');

            return;
        }

        if (e.changedTouches.length === 0) {
            consoleLog('Skipped due: 0 changedTouches');

            return;
        }

        // Not even one tick have passed
        if (ticksSinceLast === ticksSince) {
            consoleLog('Skipped due: 0 ticksSince', e.type);

            return;
        }

        // Not yet... activates scrolling
        scrollToActive = true;

        // Some info
        consoleWarn('Event', e.type, (parseInt((ticksSince - ticksSinceLast) / ticksTTL * 10000, 10) / 10000) + 's', e);

        // Remember ticks between last move to calculate difference
        ticksSinceLast = ticksSince;

        lastPositions();

        ticksSince = 0;
    });

    document.body.addEventListener('touchend', function(e) {
        var top = document.body.scrollTop,
            left = document.body.scrollLeft;
        // e.preventDefault();
        consoleLog('Event', e.type);
        // console.log(top, left);

        // Not yet... leaves momentum scrolling
        scrollToActive = 'end';

        // Make sure momentum & elastic scrolling is disabled, since during momentum
        // there's no scrollTop/scrollLeft value updated on iOS
        // if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
        // }

        lastPositions();

        // Allow next scrolling as if scroll fired; Cancells throttle during touchmove
        scrollEventFired = true;
    });

    document.body.addEventListener('touchcancel', function(e) {
        // e.preventDefault();

        // Not yet... cancels any scrolling
        scrollToActive = false;

        // Allow next scrolling as if scroll fired; Cancells throttle during touchmove
        scrollEventFired = true;

        lastPositions();

        consoleLog('Event', e.type);
    });

    window.addEventListener('click', function() {
        triggerScroll();
    }, false);

    window.addEventListener('scroll', function(e) {
        // Allow next scroll
        scrollEventFired = true;

        lastPositions();

        for (i = 0; i < scrollTargetsLength; i++) {
            consoleWarn(
                'SCROLL #', i,
                scrollTargets[i].nodeName + '#' + scrollTargets[i].id + '.' + scrollTargets[i].className.replace(/ /, '.'),
                ' .scrollTop:', scrollTargets[i].scrollTop
            );
        }
    }, false);
}(window, window.console));
