"use strict";
// Manages Routes access and web storage of data


define(['jquery'], function($) {

    var api = {
        roles: "/api/v1/roles",
        user: "/api/v1/user"
    },
        ajax = {
            steps_1: "/ajax/steps/1",
            steps_2: "/ajax/steps/2",
            steps_3: "/ajax/steps/3",
            profile_summary: "/ajax/profile/summary",
            profile_badges: "/ajax/profile/badges",
            profile_reviews: "/ajax/profile/reviews"
        };

    return {
        // Register user api key for future ajax calls, and return user data
        authenticate: function(success, fail) {
            $.ajax({
                type: "GET",
                url: api['user']
            })
                .done(function(user) {
                    $.ajaxSetup({
                        headers: {
                            "X-API-Key": user.apikey
                        }
                    });
                    delete user.apikey;
                    if (success) success(user);
                })
                .fail(function(xhr, textStatus) {
                    console.log(xhr.responseText);
                    alert("Request failed: " + textStatus);
                    if (fail) fail(xhr);
                });
        },

        // Get Ajax view content and store it if not already
        getView: function(viewId, success, fail) {
            history.pushState({
                id: viewId
            }, '', '/' + viewId.replace('_', '/'));
            if (!sessionStorage['view.' + viewId.replace('_', '.')]) {
                $.ajax({
                    type: "GET",
                    url: ajax[viewId]
                })
                    .done(function(data) {
                        sessionStorage['view.' + viewId.replace('_', '.')] = data;
                        if (success) success(data);
                    })
                    .fail(function(xhr, textStatus) {
                        console.log(xhr.responseText);
                        alert("Request failed: " + textStatus);
                        if (fail) fail(xhr);
                    });
            } else {
                if (success) success(sessionStorage['view.' + viewId.replace('_', '.')]);
            }
        },

        // Get and save data on web storage if not already there
        getData: function(dataId, success, fail) {
            if (!sessionStorage['data.' + dataId]) {
                $.ajax({
                    type: "GET",
                    url: api[dataId]
                })
                    .done(function(data) {
                        sessionStorage['data.' + dataId] = JSON.stringify(data);
                        if (success) success(data);
                    })
                    .fail(function(xhr, textStatus) {
                        console.log(xhr.responseText);
                        alert("Request failed: " + textStatus);
                        if (fail) fail(xhr);
                    });
            } else {
                if (success) success(JSON.parse(sessionStorage['data.' + dataId]));
            }
        },

        // Set data
        setData: function(dataId, action, data, success, fail) {
            if (typeof data == 'function') {
                if (success) fail = success;
                success = data;
            }

            $.ajax({
                type: 'POST',
                url: api[dataId] + (action ? "/" + action : ""),
                data: data
            })
                .done(function(data) {
                    $.ajaxSetup({
                        headers: {
                            "X-API-Key": data.apikey
                        }
                    });
                    delete data.apikey;
                    if (success) success(data);
                })
                .fail(function(xhr, textStatus) {
                    console.log(xhr.responseText);
                    alert("Request failed: " + textStatus);
                    if (fail) fail(xhr);
                });
        }
    }

});