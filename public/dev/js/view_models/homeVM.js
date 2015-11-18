"use strict";

define([
    "/js/scripts/utils.js",
    'knockout', 'moment'
], function(Utils, ko, moment) {

    var HomeViewModel = function() {

        // =========== Data 
        var self = this;

        self.username = ko.observable();
        self.joinDate = ko.observable();
        self.lastLogged = ko.observable();
        self.roles = ko.observableArray([]);


        // =========== Computed

        // Profile card last seen 
        self.lastSeen = ko.computed(function() {
            return moment(self.lastLogged()).fromNow();
        });


        // =========== Data initialize

        // User data
        Utils.authenticate(function(user) {
            self.username(user.username);
            self.joinDate(user.joinDate);
            self.lastLogged(user.lastLogged);
        });

        // Roles list
        Utils.getData('roles', function(roles) {
            self.roles(roles);
        });

    };

    ko.applyBindings(new HomeViewModel());
});