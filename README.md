scrollPolyfill.js
=================

Experimental scroll polyfil for touch devides.

Enables:

- parallax animation on devices which is not possible due to scroll event delay
- [use `overflow-y` and `position:fixed` via `position:absolute` hack](www.martinadamko.sk/posts/197)

## The problem and the solution

1. Touch does not fire during scroll on mobile/touch enabled devices.
2. Touch devices pause scripting after fast flick move until animation finishes.

Scripts trigger missing scroll events by attaching to native `touchstart`, `touchmove` and `touchend` events enabling basic paralax effects even on touch devices.

The Lite version of the script actually does no scrolling at all, just monitors areas for scrolling change. Than it triggers scroll event when the scroll change occurs. Paralax will work while slow scrolling the page, but will stop during the momentum scrolling and will continue to work only after the animation finishes. This behaviour might cause jumpy paralax experience.

If you need to support parallax during the momentum scrolling, try the full version of the script which halts native scroll and tries to emulate it back.

## How to use

This is a drop-in, no installation script. Just include the script before the `</body>` closing tag.

```html
<script src="/path/to/scrollPolyfill.js" type="text/javascript"></script>
```

## Known issues

1. Only vertical scrolling is supported
2. **Default Android Browsers** have some graphic-acceleration issues. Use the *light* version or wrap initialisation in user agent check and maybe fallback to lite version.
3. Two finger scrolling causes jumps

## Examples

- [www.kavcovanie.sk](http://www.kavcovanie.sk/)

## Room for improvements

Some ideas that might be explored in future:

1. ~~[RequestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame)~~ RAF fires just like the native solution only after the scrill has finished.
2. [Web workers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers)

Enjoy!

[@martin_adamko](http://twitter.com/martin_adamko)
