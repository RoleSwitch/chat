"use strict";

define([
    "/js/scripts/utils.js",
    'jquery_md5', 'semantic'
], function(Utils) {

    // UI Inits
    $('.ui.accordion').accordion();

    // ================================ FORMS
    // Username Update Form
    $('#updateUsernameForm')
        .form({
            email: {
                identifier: 'userName',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter a username'
                }]
            },
            password: {
                identifier: 'password',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter a password'
                }, {
                    type: 'length[6]',
                    prompt: 'Your password must be at least 6 characters'
                }]
            },
        }, {
            inline: true,
            on: 'submit',
            onFailure: function() {
                console.log('Form failed to submit!');
            },
            onSuccess: function() {
                $('#viewLoad').addClass('active');
                $("#updateUsernameErrorMsg.message").removeClass('ui green message');
                $("#updateUsernameErrorMsg.message").removeClass('red');

                var username = $('#updateUsernameForm').form('get field', 'userName').val();
                var password = $.md5($('#updateUsernameForm').form('get field', 'password').val());

                Utils.setData('user', 'updateUsername', {
                    'username': username,
                    'password': password
                }, function(data) {
                    if (data.ok === false) { // data error
                        $("#viewLoad").removeClass('active');
                        $("#updateUsernameErrorMsg.message").addClass('ui red message');
                        $("#updateUsernameErrorMsg.message").html('<i class="close icon"></i>' + data.message);
                    } else { // success
                        $("#viewLoad").removeClass('active');
                        $("#local_username").text(username);
                        $("#updateUsernameErrorMsg.message").addClass('ui green message');
                        $("#updateUsernameErrorMsg.message").html('<i class="close icon"></i>' + data.message);
                    }
                }, function(xhr) { // server error
                    $('#viewLoad').removeClass('active');
                });
            }
        });
    // Messages close event
    $(document).on('click', '#updateUsernameErrorMsg.message .close', function() {
        $('#updateUsernameErrorMsg.message').fadeOut();
    });

    // ==================================

});