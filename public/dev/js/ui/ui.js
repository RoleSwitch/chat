"use strict";

// Contains all global script code
// working on all pages of website
define(['semantic'], function() {

    // Web Storage check
    if (!('localStorage' in window) || window['localStorage'] === null) {
        console.log("Your browser doesn't support some of the functionalities. Please use a recent browser.");
        alert("Your browser doesn't support some of the functionalities. Please use a recent browser.")
    }

    // Clear session storage on page refresh
    sessionStorage.clear();

    // Error handling
    $("img").error(function() {
        $(this).hide();
    }),

    // Components initialize
    $('.ui.checkbox').checkbox();
    $('.ui.dropdown').dropdown();

    // Page scroll fix for modals
    $('.ui.modal').modal('setting', {
        onShow: function() {
            if ($(this).modal("can fit") === true)
                $('body').css('overflow', 'hidden');
        },
        onHide: function() {
            $('body').css('overflow', '');
        }
    });


    // Top Menu Active links
    if (window.location.pathname.match(/^\/(home)?$/)) {
        $('.ui.top.menu .right.menu .item .button').removeClass('active');
        $('.ui.top.menu .left.menu .item .button').addClass('active');
    } else
    if (window.location.pathname.match(/^\/profile$/)) {
        $('.ui.top.menu .left.menu .item .button').removeClass('active');
        $('.ui.top.menu .right.menu .item .button').addClass('active');
    }

});