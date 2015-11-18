"use strict";

define([
    "/js/scripts/utils.js",
    'semantic'
], function(Utils) {

    // AJAX Navigate to view
    function goToView(viewName) {
        // hide page content
        $('#profileView').transition('fade out', 200, function() {
            $(".menu #summary.item").removeClass('active');
            $(".menu #badges.item").removeClass('active');
            $(".menu #reviews.item").removeClass('active');

            $(".menu #badges.item .label").removeClass('purple');
            $(".menu #reviews.item .label").removeClass('purple');

            var loaded = false;
            setTimeout(function() {
                if (loaded === false) $('#viewLoad').addClass('active');
            }, 500);

            // get page content
            Utils.getView('profile_' + viewName, function(res) {
                loaded = true;
                $('#viewLoad').removeClass('active');
                $('#profileView').html(res); // content

                // label color
                if (viewName !== 'summary') {
                    $(".menu #" + viewName + ".item .label").addClass('purple');
                }
                // active button
                $('.menu #' + viewName + ".item").addClass('active');

                $('#profileView').transition('fade in', 200); // show
            });
        });
    }

    // Profile Top Menu button click event
    $(".menu #summary.item, .menu #badges.item, .menu #reviews.item").click(function() {
        goToView(this.id)
    });


});