"use strict";

require.config({
    // cache-bust (dev)
    urlArgs: new Date().getTime().toString(),

    //To get timely, correct error triggers in IE, force a define/shim exports check.
    enforceDefine: true,

    // libraries
    paths: {
        socketio: "/socket.io/socket.io",
        semantic: "/js/lib/semantic.min",
        jquery: "/js/lib/jquery.min",
        jquery_md5: "/js/lib/jquery.md5.min",
        knockout: "/js/lib/knockout.min",
        moment: "/js/lib/moment.min"
    },

    // settings
    shim: {
        jquery: {
            exports: '$'
        },
        jquery_md5: {
            deps: ["jquery"],
            exports: "jQuery.md5"
        },
        semantic: {
            deps: ["jquery"],
            exports: "jQuery.fn.checkbox" //some semantic module to validate load
        },
        socketio: {
            exports: 'io'
        },
        knockout: {
            exports: 'ko'
        },
        moment: {
            deps: ["jquery"],
            exports: 'moment'
        }
    }
});