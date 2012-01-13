(function($){
    $.fn.zSlider = function(options)
    {
        var i, id, opts, obj, command, config, api, slideshow;

        // Return API if requested
        if(typeof options == 'string'){
            // Make sure API data exists if requested
            if(typeof $(this).data('zSlider') !== 'object'){
            // return an error
            }


            // Return requested object
            if(options == 'api'){
                return $(this).data('zSlider').api;
            }


        }

        // Validate provided options
        else
        {
            // Set null options object if no options are provided
            
            if(!options) {
                //  console.log('creating');
                options = {};
            }

            // Sanitize option data

            // Build main options object

            opts = $.extend(true, {}, $.fn.zSlider.defaults, options);
        //console.log('sanitized');
        };

        // Iterate each matched element
        return this.each(function() // Return original elements as per jQuery guidelines
        {
            // Check for API commands
            if(typeof options == 'string')
            {
                command = options.toLowerCase();

                if(command == 'api'){
                    return $(this).data('zSlider').api;
                }

            }

            // No API commands, continue with zSlider creation
            else
            {
                
                // Create unique configuration object
                config = $.extend(true, {}, opts);

                // Determine tooltip ID (Reuse array slots if possible)

                // Instantiate the slider
                obj = new zSlider($(this), config, id);
                // console.log('obj = ',obj);

                
                $(this).data('zSlider',  obj);
                // console.log($(this).data('zSlider'));
            //console.log($(this).data('zSlider'), obj);


            };
        });
    }


    // Instantiator
    function zSlider(wrapper, options)
    {
        // Declare this reference
        var self = this;

        // Setup class attributes
        self.wrapper = wrapper;
        self.id = wrapper.attr('id');
        self.options = options;
        self.classes = options.classes;
        self.slideshow = null;
        // all slides
        self.slides = $('.'+self.classes.slide);


        // things for animations
        wrapper.css({
            'overflow' : 'hidden',
            'position' : 'relative'
        });
        if(self.options.animation.type == 'scroll'){
            self.slides.css('position', 'static').width(wrapper.width());
            var scroller;
            if(self.slides.parent().get(0) === wrapper.get(0)){
                // slide have no wrapper and we need to create a scroll wrapper
                 scroller = $('<div />').addClass('zSliderScroller');
                wrapper.append(scroller);
                scroller.append(self.slides);

            } else {
                scroller = self.slides.parent();
                scroller.addClass('zSliderScroller');
            }
            scroller.width((self.slides.length * wrapper.width()));

            scroller.height(wrapper.height());
            self.scroller = scroller;
        } else if (self.options.animation.type == 'vertical' || self.options.animation.type == 'horizontal') {
            self.slides.css('position', 'absolute');
        }




        //do things if animation type is scroll
        // find out if its wrapped in anything
        // set its total width to combined slide width

        
        // these are the api stuff
        self.api = {
            playSlideshow: function(){
                if(self.slideshow == null){
                    self.slideshow = setInterval(function(){
                        self.api.displayNext();
                    }, self.options.slideshow);
                }
            },
            pauseSlideshow: function(){
                clearInterval(self.slideshow);
                self.slideshow = null;
            },
            displayNext: function() {
                var active = self.slides.filter('.'+self.classes.active);

                // determine if its the last slide, only go to the first slide if its continuous
                var nextSlide = false;
                if($('.'+self.classes.slide+':last').hasClass(self.classes.active)){
                    if(self.options.continuous){
                        nextSlide = $('.'+self.classes.slide+':first');
                    }
                } else {
                    nextSlide = active.next();
                }
                if(nextSlide) self.api.displaySlide(nextSlide);
            },
            displayPrevious: function() {
                var active = self.slides.filter('.'+self.classes.active);
                // determine if its the last slide, only go to the first slide if its continuous
                var previousSlide = false;
                if($('.'+self.classes.slide+':first').hasClass(self.classes.active)){
                    if(self.options.continuous){
                        previousSlide = $('.'+self.classes.slide+':last');
                    }
                } else {
                    previousSlide = active.prev();
                }
                if(previousSlide) self.api.displaySlide(previousSlide);
            },
            displaySlide: function(slide){
                //self.slides.css('position', 'absolute');
                var current = self.api.getActiveSlide();
                var animationOptions = self.options.animation;
                var offset;
                // delay options for animation
                self.slides.removeClass(self.classes.active);
                slide.addClass(self.classes.active);
                if (animationOptions.type == 'vertical') {
                    // get offset

                    offset = wrapper.height();
                    // position slide
                    slide.css({
                        'top' : '-'+offset+'px'
                    }
                    ).show();
                    current.animate({
                        'top': offset+'px'
                    }, animationOptions.duration, function(){
                        // delay showing new slide if delay is 0 then it shows right after animation is done
                        if(animationOptions.delay !== null){
                            setTimeout(function(){
                                slide.animate({
                                    'top': '0px'
                                }, animationOptions.duration);
                            }, animationOptions.delay);
                        }
                        current.hide();
                    });
                    if(animationOptions.delay === null){
                        // console.log('showing my slide', slide);
                        slide.animate({
                            'top': '0px'
                        }, animationOptions.duration);
                    }

                }
                else if (animationOptions.type == 'horizontal') {
                    offset = wrapper.width();

                    slide.css({
                        'left' : offset+'px'
                    }
                    ).show();
                    current.animate({
                        'left': '-'+offset+'px'
                    }, animationOptions.duration, function(){
                        // delay showing new slide if delay is 0 then it shows right after animation is done
                        current.hide();
                        if(animationOptions.delay !== null){
                            setTimeout(function(){
                                slide.animate({
                                    'left': '0px'
                                }, animationOptions.duration);
                            }, animationOptions.delay);
                        }
                    });
                    if(animationOptions.delay === null){
                        slide.animate({
                            'left': '0px'
                        }, animationOptions.duration);
                    }
                    
                }
                else if (animationOptions.type == 'scroll') {
                    var index = slide.index();
                    offset = wrapper.width();
                    offset = offset * index;
                    self.scroller.animate({
                        'left': '-'+offset+'px'
                    }, animationOptions.duration, function(){
                        // delay showing new slide if delay is 0 then it shows right after animation is done
                    });
                }
                else {
                    //show new slide via fade
                    self.slides.fadeOut(animationOptions.duration, function(){
                        // delay showing new slide if delay is 0 then it shows right after animation is done
                        if(animationOptions.delay !== null){
                            setTimeout(function(){
                                slide.fadeIn(animationOptions.duration);
                            }, animationOptions.delay);
                        }
                    });
                    // concurrent animation if delay is null
                    if(animationOptions.delay === null){
                        slide.fadeIn(animationOptions.duration);
                    }
                }
                if(self.options.navigation.carousel){
                    $('.'+self.classes.carousel).removeClass(self.classes.active);
                    var carouselId = self.options.carouselPrefix+slide.attr('id');
                    $('#'+carouselId).addClass(self.classes.active);
                }
                if(self.options.continuous === false && $('.'+self.classes.slide+':last').hasClass(self.classes.active)){
                    self.api.pauseSlideshow();
                }
            },

            getActiveSlide: function(){
                return self.slides.filter('.'+self.classes.active);
            }



        };
        if(this.slides.filter('.'+self.classes.active).length != 0){
            if(self.options.animation.type != 'scroll'){
                this.slides.not('.'+self.classes.active).hide();
            }
        } else {
            this.slides.first().addClass(self.classes.active);
            if(self.options.animation.type != 'scroll'){
                this.slides.not(':first').hide();
            }
        }




        if(options.slideshow){
            this.api.playSlideshow();
        }

        setClickListeners();


        function setClickListeners() {
            // arrow navigation
            if(self.options.navigation.arrow){
                $('.'+self.classes.prevButton).click(function(event){
                    self.api.displayPrevious();
                    if(self.options.slideshow && self.slideshow){
                        resetSlideshow();
                    }

                });
                $('.'+self.classes.nextButton).click(function(event){
                    self.api.displayNext();
                    if(self.options.slideshow && self.slideshow){
                        resetSlideshow();
                    }
                });
            }
            //carasoul navigation
            if(self.options.navigation.carousel){
                $('.'+self.classes.carousel).click(function(event){
                    var targetId = $(event.target).attr('id');
                    var slideId = targetId.replace(self.options.carouselPrefix, '');
                    var slide = $('#'+slideId);
                    
                    self.api.displaySlide(slide);
                    if(self.options.slideshow && self.slideshow){
                        resetSlideshow();
                    }
                });
            }
        // slideshow controls
            
        }

        // reset slideshow timer
        function resetSlideshow() {
            self.api.pauseSlideshow();
            self.api.playSlideshow();
        }

        return this;
    }


    $.fn.zSlider.defaults = {
        // Slideshow
        slideshow:  7000,
        continuous: true,
        // Animation
        animation: { 
            type :'fade', // fade | vertical | horizontal | scroll (coda style)
            delay: null, // null or delay wait for a callback 
            duration: 250
        },
        // Navigation
        navigation: {
            arrow: true,
            carousel: false,
            slideshow: false,
            keyboard: false
        },
        // Prefixes
        prefix: 'zSlide',
        carouselPrefix: 'nav-',
        // set classes
        classes: {
            prevButton: 'prevButton',
            nextButton: 'nextButton',
            playButton: 'playButton',
            pauseButton: 'pauseButton',
            slide: 'zSlide',
            active: 'active',
            carousel: 'zSlideCarousel'
        }
    };
})(jQuery);