(function ($) {
	"use strict";

/*=============================================
	=    		 Preloader			      =
=============================================*/
    function preloader() {        
        jQuery('.smart-page-loader').delay(0).fadeOut();
        jQuery('body:not(".elementor-editor-active")').removeClass('wp-smart-body');
    };

    $(window).on('load', function () {
        preloader();
        
    });
     

     

    //===Header Sticky===
    $(window).on('scroll', function () {
        var scroll = $(window).scrollTop();
        if (scroll < 245) {
            $("#sticky-header").removeClass("sticky-menu");
            $('.scroll-to-target').removeClass('open');

        } else {
            $("#sticky-header").addClass("sticky-menu");
            $('.scroll-to-target').addClass('open');
        }
    });
    if ($('.scroll-to-target').length) {
        $(".scroll-to-target").on('click', function () {
            var target = $(this).attr('data-target');
            // animate
            $('html, body').animate({
                scrollTop: $(target).offset().top
            }, 1000);

        });
    }

    //Submenu Dropdown Toggle
    if ($('.main-header li.dropdown ul').length) {
        $('.main-header li.dropdown').append('<div class="dropdown-btn"><span class="fa fa-angle-down"></span></div>');

        //Dropdown Button
        $('.main-header li.dropdown .dropdown-btn').on('click', function () {
            $(this).prev('ul').slideToggle(500);
        });

        //Disable dropdown parent link
        //$('.main-header .navigation li.dropdown > a,.hidden-bar .side-menu li.dropdown > a').on('click', function(e) {
        //e.preventDefault();
        //});
    }

    //Mobile Nav Hide Show
    if ($('.mobile-menu').length) {

        var mobileMenuContent = $('.main-header .nav-outer .main-menu .navigation').html();
        $('.mobile-menu .navigation').append(mobileMenuContent);
        $('.sticky-header .navigation').append(mobileMenuContent);
        $('.mobile-menu .close-btn').on('click', function () {
            $('body').removeClass('mobile-menu-visible');
        });
        //Dropdown Button
        $('.mobile-menu li.dropdown .dropdown-btn').on('click', function () {
            $(this).prev('ul').slideToggle(500);
        });
        //Menu Toggle Btn
        $('.mobile-nav-toggler').on('click', function () {
            $('body').addClass('mobile-menu-visible');
        });

        //Menu Toggle Btn
        $('.mobile-menu .menu-backdrop,.mobile-menu .close-btn').on('click', function () {
            $('body').removeClass('mobile-menu-visible');
        });

    }
    $('.main-carousel').owlCarousel({         
        loop: true,
        margin: 40,
        fluidSpeed: true,
        smartSpeed: 3000,
        responsiveClass: true,
        dots: false,
        navText: ['', ''],
        nav: true,
        autoplay: true,
        autoplaySpeed: 3000,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1,
            },
            400: {
                items: 1,
            },
            600: {
                items: 3,
            },
            1000: {
                items: 4,
            },
            1920: {
                items: 6
            }
        }
         
    });
   $('.event-carousel').owlCarousel({         
        loop: true,
        margin: 20,
        fluidSpeed: true,
        smartSpeed: 3000,
        responsiveClass: true,
        dots: false,
        navText: ['', ''],
        nav: true,
        autoplay: true,
        autoplaySpeed: 3000,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1,
            },
            400: {
                items: 1,
            },
            600: {
                items: 3,
            },
            1000: {
                items: 4,
            },
            1920: {
                items: 6
            }
        }
         
    });
})(jQuery);