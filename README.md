# noscroll.js
### Super small (1kb gzipped) and simple JS plugin for getting rid of standart browser scroll bar

The library's main purpose is to make content scrolling close to the tablets' swipe-style and without space-consuming and sometimes ugly browser scrollbar. It scrolls the content with nice fading animation similar to the ipad one. It supports all standart content scolling actions such as mouse wheel scroll, arrow-keys, pageups and downs, home-end keys. Besides it reacts on mouse swipe- and grag-gestures and gracefully scroll content.
The plugin works in very simple way: all content you need to scroll you place into div with of content-depended height (or width if the content is to be scrolled horizontally) content-wrapper. The div then placed into a 'viewport' div, the closest analogue of that is a tablet's screen. That viewport div registers all content-scrolling actions and translates inner content-wrapper accordingly.

No dependencies, vanillaJS.

### Usage
#### markup
All You need is to stick to the following div structure:
```html
<div class="viewport">
	<div id="indicator"></div>
	<div id="scrollable" class="container">
		<!-- your content here -->
	</div>
</div>
```
So here is a breakdown:
##### viewport
div.viewport - is a viewport as mentioned above and should be
```css
.viewport {
	position: relative;
	overflow: hidden;
}
```
'position: relative' to place scroll indicator properly and 'overflow: hidden;' to cut off scrolled content

##### indicator
element that scrolls to the bottom/right of the viewport to indicate overall progress of the scrolling. Custom it as you want in your css, but keep in mind that height and width of it is calculated once in the plugin initialization.

##### container
Usually there is no additional work required if you want to replace vertical scrolling since browsers naturally stack elements vertically. You need just to assure that browser calculates height of the div content-dependently. Check for floatings of elements and absolute positioning (or anything that impedes right height calculation) in your content and fix it.
If your content markup stacks horizontally, you typically need to make some workarounds. In my examples I use 'display: inline-block;' and 'white-space: nowrap;' on the container and 'display: inline-block;' on content elements to make content elements stack as I want.

#### javascript
is plain:
```javascript
	noscrolljs.applyit_to( 'scrollable', {
		direction: 'vertical',	// vertical/horizontal scroll direction
		indicator: 'indicator',	// id of indicator element
		wheel_mutiplier: 300,	// strength of wheel scroll
		arrows_speed: 600,		// strength of arrow pushes
		inertion: 325				// inertia of your content
	} );
```
'scrollable' - id of the element with content.

After the plugin sensitive dimentions of your content change (for example some element collapsed), you should call 'noscrolljs.calculate_scrolling()' to recalculate scroll maximums. Since there is no any not-hackie way to listen to an element height change event, the plugin left the care about it to you )


## Contributions
This verion is a raw beta. There is a lot to do here:
  * Touch devices themselves are not supported ;)
  * Browsers compatibility (tested in updated chrome and firefox)

If you want to contribute, please:

  * Fork the project.
  * Make your feature addition or bug fix.
  * Add yourself to the list of contributors in the README.md.
  * Send me a pull request on Github.

###License
And of course noscrolljs is licensed under the [MIT license](http://opensource.org/licenses/MIT).