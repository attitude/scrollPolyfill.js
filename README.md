scrollPolyfill.js
=================

Scroll Polyfil for touch devides allows:

- parallax animation on devices which is not possible due to scroll event delay
- [use `overflow-y` and `position:fixed` via `position:absolute` hack](www.martinadamko.sk/posts/197)

## The problem

Touch does not fire during scroll on mobile/touch enabled devices. This polyfill triggers missing scroll events using native `touchstart`, `touchmove` and `touchend` events not interval to maintain high performance.

Since JavaScript does not run after releasing touch (after fast flick move) causing the momentum scrolling until the animation finishes, this polyfill tries to emulate native scroll feel with momentum.

## How to use

This is a drop-in, no installation script. Just include the script before the `</body>` closing tag.

```html
<script src="/path/to/scrollPolyfill.js" type="text/javascript"></script>
```

The light version of the script actually does no scrolling at all, just monitors areas for scrolling change.
Than it triggers scroll event when the scroll change occurs.

## Known issues

1. Only vertical scrolling is supported
2. Default Android Browsers have some graphic-acceleration issues. Use the *light* version or wrap initialisation in user agent check and maybe fallback to lite version.
3. Two finger scrolling is causes jumps

## Examples

- [www.kavcovanie.sk](http://www.kavcovanie.sk/)

## Room for improvements

Some ideas that might be explored in future:

1. ~~[RequestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame)~~ RAF fires just like the native solution only after the scrill has finished.
2. [Web workers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers)

Enjoy!

[@martin_adamko](http://twitter.com/martin_adamko)
