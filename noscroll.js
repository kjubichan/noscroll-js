( function(nsjs) {
	var 	content,
			viewport,
			options,
			viewport_height,
			max, min,
			mouse_pos, prev_mouse_pos, pos,
			ticker_pos,
			velocity = 0,
			move_delta = 0,
			relative,
			hand_control = false,
			started_animation = false,
			style_name, 
			indicator,
			last_time,
			inertia_starts,
			holded = false,
			halt_threshold = 2,
			halt_counter = halt_threshold,
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

	function merge_options( obj1, obj2 )
	{
		var obj3 = {};
		for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
		for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
		return obj3;
	};

	function y_position( event ) {
		if ( event.targetTouches && event.targetTouches.length > 0 ) {
			return event.targetTouches[0].clientY;
		}
		return event.clientY;
	};
	
	function scroll_content( y ) {
		pos = y

		if ( pos < max ) {
			pos = max;
			velocity = 0;
		} else if ( pos > min ) {
			velocity = 0;
			pos = min;
		}

		content.style[ style_name ] = 'translateY(' + (pos) + 'px)';
		indicator.style[ style_name ] = 'translateY(' + ( pos * relative) + 'px)';
	};

	// call it after every change of velocity
	function init_inertia( ) {
		if ( (pos + velocity ) < max && ( velocity < 0 ) ) {
			velocity = max - pos;
		} else if ( (pos + velocity) > min && ( velocity > 0 ) ) {
			velocity = (min - pos);
		}
		start_velocity = velocity;
		start_pos = pos;
		inertia_starts = Date.now();

		if (!started_animation) 
		{
			requestAnimationFrame( inertia_scroll );
			started_animation = true;
		}
	};

	function inertia_scroll() {
		move_delta = start_velocity * (1 - Math.exp(-(Date.now() - inertia_starts) / options.inertion ));
		velocity = start_velocity - move_delta;
		if ( move_delta < -0.5 || move_delta > 0.5 ) {
			requestAnimationFrame( inertia_scroll );
			scroll_content( start_pos + move_delta );
		} else {
			started_animation = false;
		}
	};

	function touch( event ) {
		console.log('touch');
		halt_counter = halt_threshold;
		hand_control = !started_animation;
		mouse_pos = viewport.getBoundingClientRect().top + y_position( event );
		last_time = Date.now();
		clearInterval( accumulator_ticker );
		window.addEventListener( 'mousemove', handle_mouse_move );
		window.addEventListener( 'mouseup', release );
		accumulator_ticker = setInterval( track_drag, 100 );
		prev_mouse_pos = mouse_pos;
		ticker_pos = mouse_pos;

		event.stopPropagation();
		return false;
	};

	function release( event ) {
		clearInterval( accumulator_ticker );
		console.log('speed: ' + velocity);
		window.removeEventListener( 'mousemove', handle_mouse_move );
		window.removeEventListener( 'mouseup', release );
		hand_control = false;
		init_inertia();
		event.preventDefault();
		event.stopPropagation();
		return false;
	};

	function add_speed( vector ) {
		if ( vector == 0 ) 
		{
			if ( halt_counter == 0 ) 
			{
				velocity = 0;
				console.log('halt!');
				halt_counter = halt_threshold;
				hand_control = true;
			} else 
			{
				halt_counter--;
				velocity = velocity / 2.0;
			}
		}
		else
			velocity = (velocity + vector) / 2.0;
	};

	function track_drag() {
		var 	now = Date.now();
		add_speed( 1000*( mouse_pos - ticker_pos ) / ( now - last_time ) );
		if ( !hand_control ) {
			init_inertia();
		}
		ticker_pos = mouse_pos;
		last_time = now;
	};

	function wheel(event) {
		var 	event = window.event || event, // old IE support
				delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
		add_speed( delta*options.wheel_mutiplier );
		init_inertia();
		event.stopPropagation();
		event.preventDefault();
	};

	function handle_mouse_move(event) {
		
		event = event || window.event;
		mouse_pos = event.clientY;
		if ( hand_control ) {
			scroll_content( pos + mouse_pos - prev_mouse_pos );
			prev_mouse_pos = mouse_pos;
		}
		event.preventDefault();
		event.stopPropagation();
	};


	nsjs.calculate_scrolling = function() {
		viewport_height = parseInt( getComputedStyle( content.parentNode ).height, 10 );
		max = viewport_height - parseInt( getComputedStyle(content).height, 10 );
		if ( max > 0 ) { max = 0; }
		relative = (viewport_height - parseInt( getComputedStyle(indicator).height, 10 ) )/ max;
	};

	nsjs.applyit_to = function( target, opt ) {
		
		var default_options = {
			direction: 'vertical',
			indicator: 'indicator',
			wheel_mutiplier: 300,
			inertion: 325
		};
		options = typeof opt !== 'undefined' ? merge_options( default_options, opt ) : default_options;

		content = document.getElementById( target ),
		viewport = content.parentNode,
		indicator = document.getElementById( options.indicator );
		velocity = 0;

		// prevent content from moving due to child elements margins
		content.style[ 'overflow'] = 'auto';

		if ( typeof window.ontouchstart !== 'undefined' ) {
			viewport.addEventListener('touchstart', touch);
		}
		viewport.addEventListener( 'mousedown', touch );

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