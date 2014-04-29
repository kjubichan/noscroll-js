( function(nsjs) {
	var 	content,
			viewport,
			viewport_height,
			max, min,
			mouse_pos, prev_mouse_pos, pos,
			velocity = 0,
			relative,
			style_name, 
			indicator,
			last_time,
			inertia_starts,
			timeConstant = 325,
			accumulator_ticker,
			resizeTimeout;

	function resizeThrottler() {
		if ( !resizeTimeout ) {
			resizeTimeout = setTimeout( function() {
				resizeTimeout = null;
				nsjs.calculate_scrolling();
			}, 66);
		}
	};

	function y_position( event ) {
		if ( event.targetTouches && event.targetTouches.length > 0 ) {
			return event.targetTouches[0].clientY;
		}
		return event.clientY;
	};
	
	function scroll_content( y ) {
		pos = y
		content.style[ style_name ] = 'translateY(' + (pos) + 'px)';
		indicator.style[ style_name ] = 'translateY(' + ( pos * relative) + 'px)';
	};

	// call it after every change of velocity
	function init_inertia() {
		inertia_starts = Date.now();
		start_velocity = velocity;
	};

	function inertia_scroll() {
		var elapsed, delta_y;

		// if ( pos < max ) {
		// 	if ( velocity >= 0 )
		// 		velocity = ( max - pos );
		// 	else
		// 		velocity += ( max - pos );
		// 	init_inertia();
		// } else if ( pos > min ) {
		// 	if ( velocity <= 0 ) 
		// 		velocity = ( pos - min );
		// 	else
		// 		velocity -= ( pos - min );
		// 	init_inertia();
		// }
		if ( velocity ) {
			elapsed = Date.now() - inertia_starts;
			velocity = start_velocity * Math.exp(-elapsed / timeConstant);
			if ( velocity < -0.5 || velocity > 0.5 || pos < max || pos > min ) {
				requestAnimationFrame( inertia_scroll );
				scroll_content( pos + velocity*0.08 );
			} else {
				velocity = 0.0;
			}
		}
	};

	function tap( event ) {
		mouse_pos = viewport.getBoundingClientRect().top + y_position( event );
		last_time = Date.now();
		clearInterval( accumulator_ticker );
		accumulator_ticker = setInterval( track_drag, 100 );

		prev_mouse_pos = mouse_pos;
		window.onmousemove = handle_mouse_move;
		window.onmouseup = release;

		event.stopPropagation();
		return false;
	};

	function release( event ) {
		clearInterval( accumulator_ticker );
		window.onmousemove = null;
		window.onmouseup = null;
		event.preventDefault();
		event.stopPropagation();
		return false;
	};

	function add_speed( vector ) {
		if ( velocity == 0 && vector ) {
			requestAnimationFrame( inertia_scroll );
		}
		velocity = (velocity + vector) / 2.0;
		init_inertia();
	};

	function track_drag() {
		var 	now = Date.now();
		add_speed( 1000 * (mouse_pos - prev_mouse_pos) / ( now - last_time ) / 1.6 );
		prev_mouse_pos = mouse_pos;
		last_time = now;
	};

	function wheel(event) {
		var 	event = window.event || event, // old IE support
				delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
		
		add_speed( delta*100 );
		event.stopPropagation();
		event.preventDefault();
	};

	function handle_mouse_move(event) {
		event = event || window.event;
		mouse_pos = event.clientY;
		event.preventDefault();
		event.stopPropagation();
	};

	nsjs.calculate_scrolling = function() {
		viewport_height = parseInt( getComputedStyle( content.parentNode ).height, 10 );
		max = viewport_height - parseInt( getComputedStyle(content).height, 10 );
		if ( max > 0 ) { max = 0; }
		relative = (viewport_height - parseInt( getComputedStyle(indicator).height, 10 ) )/ max;
	};

	nsjs.applyit_to = function( target ) {
		content = document.getElementById( target ),
		viewport = content.parentNode,
		indicator = document.getElementById('indicator');
		velocity = 0;

		if ( typeof window.ontouchstart !== 'undefined' ) {
			viewport.addEventListener('touchstart', tap);
		}
		viewport.addEventListener( 'mousedown', tap );

		viewport.style.cursor = "move";

		if (viewport.addEventListener) {
			// IE9, Chrome, Safari, Opera
			viewport.addEventListener("mousewheel", wheel, false);
			// Firefox
			viewport.addEventListener("DOMMouseScroll", wheel, false);
		}
		else  // IE 6/7/8
			viewport.attachEvent("onmousewheel", wheel);

		window.addEventListener("resize", resizeThrottler, false);

		nsjs.calculate_scrolling();
		pos = min = 0;
		style_name = 'transform';
		['webkit', 'Moz', 'o', 'ms'].every( function ( prefix ) {
			var e = prefix + 'Transform';

			if ( typeof content.style[e] !== 'undefined' ) {
				style_name = e;
				return false;
			}
			return true;
		} );
	};

} )( this.noscrolljs = this.noscrolljs || {} );