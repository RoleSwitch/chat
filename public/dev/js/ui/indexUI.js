"use strict";

define([
    "/js/scripts/utils.js",
    'semantic', 'jquery_md5'
], function(Utils) {

    // ================= ASSISTANT =================
    var stepNbr = 1, //current step
        nSteps = 3; //step numbers

    // AJAX Navigate to step
    function gotoStep(nbr, callback) {
        // highlight next step label
        $('#step' + stepNbr).removeClass('active');
        $('#step' + stepNbr).addClass('disabled');
        stepNbr = nbr;
        $('#step' + stepNbr).addClass('active');
        $('#step' + stepNbr).removeClass('disabled');
        // hide step content
        $('#stepView').transition('fade out', 200, function() {
            // set timeout for loading dimmer
            var loaded = false;
            setTimeout(function() {
                if (loaded === false) $('#stepLoad').addClass('active');
            }, 500);

            // get ajax step view
            Utils.getView('steps_' + stepNbr, function(res) {
                loaded = true;
                $('#stepLoad').removeClass('active');

                $('#stepView').html(res);
                $('#stepView').transition('fade in', 200, callback);
            });
        });
    }

    // Launch session start assistant
    $('#Try.button').click(function() {
        gotoStep(1, function() {
            $('.ui.negative.button').text('Cancel');
            $('.ui.positive.button').text('Continue');
        });
    });

    // ================= MODALS =================
    $('.Assistant.modal')
        .modal('setting', {
            closable: false,
            allowMultiple: false,
            // back
            onDeny: function() {
                if (stepNbr === 1) return true; //cancel
                else {
                    gotoStep(stepNbr - 1, function() {
                        if (stepNbr === 1) $('.ui.negative.button').text('Cancel');
                        $('.ui.positive.button').text('Continue');
                    });
                }
                return false;
            },
            // next
            onApprove: function() {
                if (stepNbr === nSteps) {
                    //ajouter ici code pour validation modal
                    $('.Session.modal').modal('show');
                    //return true;
                } else {
                    gotoStep(stepNbr + 1, function() {
                        if (stepNbr === nSteps) $('.ui.positive.button').text('Go!');
                        $('.ui.negative.button').text('Previous');
                    });
                }
                return false;
            },
            transition: 'scale',
            duration: 300
        })
        .modal('attach events', '#Try.button', 'show');

    $('.Session.modal')
        .modal('setting', {
            closable: false,
            allowMultiple: false,
            transition: 'vertical flip',
            duration: 200
        });

    // ================= FORMS =================

    // LOGIN FORM
    $('.ui.Login.form')
        .form({
            email: {
                identifier: 'lg_email',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter an email address'
                }, {
                    type: 'email',
                    prompt: 'Your email address is invalid'
                }]
            },
            password: {
                identifier: 'lg_password',
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
            on: 'blur',
            onFailure: function() {
                console.log('Form failed to submit!');
            },
            onSuccess: function() {
                $('#loading').addClass('active');

                var email = $('.ui.Login.form').form('get field', 'lg_email').val();
                var password = $.md5($('.ui.Login.form').form('get field', 'lg_password').val());
                var rememberme = $('#rememberme').prop('checked') ? "yes" : "no";

                $.post('/login', {
                    'email': email,
                    'password': password,
                    'rememberme': rememberme
                }).done(function(data) {

                    if (data.ok === false) { // data error

                        $('#loading').removeClass('active');
                        $("#loginErrorMsg").addClass('ui red message');
                        $("#loginErrorMsg").html('<i class="close icon"></i>' + data.message);

                    } else { // success

                        $('#loading').removeClass('active');
                        window.location.href = "/home";

                    }
                }).fail(function(xhr, textStatus, errorThrown) { // server error
                    $('#loading').removeClass('active');
                    console.log(xhr.responseText);
                    $("#registerErrorMsg").addClass('ui red message');
                    var message;
                    switch (xhr.status) {
                        case 401:
                            message = "Authentification failed!"
                            break;
                        default:
                            message = "";
                            break;
                    }
                    $("#registerErrorMsg").html('<i class="close icon"></i>' + message);
                });
            }
        });
    // messages close event
    $(document).on('click', '#loginErrorMsg.message .close', function() {
        $('#loginErrorMsg.message').fadeOut();
    });

    // REGISTER FORM
    $('.ui.Register.form')
        .form({
            username: {
                identifier: 'rg_username',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter a username'
                }, {
                    type: 'maxLength[30]',
                    prompt: 'Username length must not exceed 30 characters'
                }]
            },
            email: {
                identifier: 'rg_email',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter an email address'
                }, {
                    type: 'email',
                    prompt: 'Your email address is invalid'
                }]
            },
            password: {
                identifier: 'rg_password',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter a password'
                }, {
                    type: 'length[6]',
                    prompt: 'Your password must be at least 6 characters'
                }]
            },
            terms: {
                identifier: 'rg_terms',
                rules: [{
                    type: 'checked',
                    prompt: 'You must agree to the terms and conditions'
                }]
            }
        }, {
            inline: true,
            on: 'submit',
            onFailure: function() {
                console.log('Form failed to submit!');
            },
            onSuccess: function() {
                $('#loading').addClass('active');

                var username = $('.ui.Register.form').form('get field', 'rg_username').val();
                var email = $('.ui.Register.form').form('get field', 'rg_email').val();
                var password = $.md5($('.ui.Register.form').form('get field', 'rg_password').val());

                $.post('/signup', {
                    'email': email,
                    'username': username,
                    'password': password
                })
                    .done(function(data) {
                        console.log(data);
                        if (data.ok === false) { // data error
                            $('#loading').removeClass('active');
                            $("#registerErrorMsg").addClass('ui red message');
                            $("#registerErrorMsg").html('<i class="close icon"></i>' + data.message);
                        } else { // success
                            $('#loading').removeClass('active');
                            window.location.href = "/home";
                        }
                    })
                    .fail(function(xhr, textStatus, errorThrown) { // server error
                        console.log(xhr.responseText);
                        $('#loading').removeClass('active');
                        alert(textStatus);
                    });
            }
        });
    // messages close event
    $(document).on('click', '#registerErrorMsg.message .close', function() {
        $('#registerErrorMsg.message').fadeOut();
    });

    // =================

    $('input#username').on('change', function() {
        $('.Username.input').removeClass('error');

        if ($(this).val().length > 0) {
            $('.Username.input').addClass('loading');

            $.get('/ajax/validate/username/' + $(this).val())
                .done(function(res) {
                    $('.Username.input').removeClass('loading');
                    if (res.ok === false) {
                        $('.Username.input').addClass('error');
                    }
                })
                .fail(function(xhr, textStatus, errorThrown) { // server error
                    console.log(xhr.responseText);
                    alert(xhr.responseText);
                });
        }
    });

});