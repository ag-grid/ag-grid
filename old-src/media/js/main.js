;(function () {
	
	'use strict';

	// iPad and iPod detection	
	var isiPad = function(){
		return (navigator.platform.indexOf("iPad") != -1);
	};

	var isiPhone = function(){
	    return (
			(navigator.platform.indexOf("iPhone") != -1) || 
			(navigator.platform.indexOf("iPod") != -1)
	    );
	};

	// Burger Menu
	var burgerMenu = function() {
		$('body').on('click', '.js-fh5co-nav-toggle', function(){
			if ( $('#fh5co-navbar').is(':visible') ) {
				$(this).removeClass('active');	
			} else {
				$(this).addClass('active');	
			}
			
		});
	};


	// Animate Projects
	
	var animateBox = function() {
		if ( $('.animate-box').length > 0 ) {
			$('.animate-box').waypoint( function( direction ) {
										
				if( direction === 'down' && !$(this.element).hasClass('animated') ) {

					$(this.element).addClass('fadeIn animated');
						
				}
			} , { offset: '80%' } );
		}
	};


	// Animate Leadership
	var animateTeam = function() {
		if ( $('#fh5co-team').length > 0 ) {	
			$('#fh5co-team .to-animate').each(function( k ) {
				
				var el = $(this);
				
				setTimeout ( function () {
					console.log('yaya');
					el.addClass('fadeInUp animated');
				},  k * 200, 'easeInOutExpo' );
				
			});
		}
	};
	var teamWayPoint = function() {
		if ( $('#fh5co-team').length > 0 ) {
			$('#fh5co-team').waypoint( function( direction ) {
										
				if( direction === 'down' && !$(this.element).hasClass('animated') ) {

					setTimeout(animateTeam, 200);
					
					
					$(this.element).addClass('animated');
						
				}
			} , { offset: '80%' } );
		}
	};


	// Animate Feature
	var animateFeatureIcons = function() {
		if ( $('#fh5co-services').length > 0 ) {	
			$('#fh5co-services .to-animate').each(function( k ) {
				
				var el = $(this);
				
				setTimeout ( function () {
					el.addClass('bounceIn animated');
				},  k * 200, 'easeInOutExpo' );
				
			});
		}
	};
	var featureIconsWayPoint = function() {
		if ( $('#fh5co-services').length > 0 ) {
			$('#fh5co-services').waypoint( function( direction ) {
										
				if( direction === 'down' && !$(this.element).hasClass('animated') ) {
					
					
					

					setTimeout(animateFeatureIcons, 200);
					
					
					$(this.element).addClass('animated');
						
				}
			} , { offset: '80%' } );
		}
	};



	
	

	

	
	$(function(){
		
		burgerMenu();
		animateBox();
		teamWayPoint();
		featureIconsWayPoint();
		
		

	});


}());