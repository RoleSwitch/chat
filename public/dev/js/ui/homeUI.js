"use strict";

define([
    "/js/scripts/utils.js",
    'semantic'
], function(Utils) {

    // =============================== DIMMERS
    // First-time Login
    if ($('.FirstLogin.dimmer').length) { // if element in DOM
        $('.FirstLogin.dimmer').dimmer({
            closable: true,
            transition: 'fade',
            duration: 1000,
            onShow: function() {
                $('body').css('overflow', 'hidden'); // hide scroll
            },
            onHide: function() {
                $('body').css('overflow', ''); // show scroll
            }
        }).dimmer('show');

        // close button
        $('.FirstLogin .Close.button').click(function() {
            Utils.setData('user', 'firstLogin',
                function(data) {
                    if (data.err === 0) {
                        $('.FirstLogin.dimmer').dimmer('hide');
                    } else {
                        console.log(JSON.stringify(data));
                        alert(JSON.stringify(data));
                    }
                });
        });
    }

    // Live option enable/disable on checkbox change event
    var checkboxRevert = false;
    $('.Live.checkbox').checkbox({
        'onChange': function() {
            if (checkboxRevert === true) checkboxRevert = false; // checkbox value reverted on error
            else {
                var value = ($('input[name="live"][type="checkbox"]').prop('checked') ? "on" : "off");
                Utils.setData('user', 'live', value,
                    function(data) {
                        if (data.err !== 0) {
                            console.log(data);
                            alert(JSON.stringify(data));
                            checkboxRevert = true;
                            $('.Live.checkbox').checkbox('toggle');
                        }
                    }, function(xhr) {
                        checkboxRevert = true;
                        $('.Live.checkbox').checkbox('toggle');
                    });
            }
        }
    });

    // Show edit button to update role
    $('.QuickSwitch.segment .dimmable.image').dimmer({
        on: 'hover',
        duration: {
            show: 250,
            hide: 100 // display bug fix, must not be higher
        },
        closable: false
    });

    // =============================== MODALS
    // Session Modal
    $('.Session.modal')
        .modal('setting', {
            closable: false,
            allowMultiple: false,
            transition: 'vertical flip',
            duration: 300
        })
        .modal('attach events', '#startSession', 'show');

    // Roles modal    
    $('.Roles.modal')
        .modal('setting', {
            closable: true,
            allowMultiple: false,
            onShow: function() {
                Utils.getView('steps_1', function(partial) {
                    $('#rolesView').html(partial);
                });
            },
            transition: 'scale',
            duration: 250
        })
        .modal('attach events', '#showRoles', 'show');

    // Get the selected role and update the profile card role label
    // TODO : Store the role in database
    $('div[id^="role_"]').click(function() {
        var name = (this.id).split('_')[1];
        $('.CurrentRole').text(name);
        // $('.Role.image').attr('src', 'img/roles/' + name + '.png')
    });

    //Automatic URL Actions
    if (window.location.search.match(/\?start$/)) {
        $('.Session.modal').modal('show');
    }

});