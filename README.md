touchScroll.js
==============

Scroll Polyfil for Touch Devides

## The problem

Touch does not fire during scroll on mobile devices with touch. This polyfill triggers missing scroll events using native `touchstart`, `touchmove` and `touchend` events not interval to maintain high performance.

## How to use

Just include the script just before the `</body>` closing tag.

```html
<script src="/path/to/touchScroll.min.js" type="text/javascript"></script>
```

## Known issues

JavaScript seems not to run after releasing touch (after fast flick move) causing the momentum scrolling until the animation finishes. I am not sure if there is a workoround to this.

Some ideas that might be explored in future:

1. [RequestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame)
2. [Web workers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers)

Enjoy!

[@martin_adamko](http://twitter.com/martin_adamko)
