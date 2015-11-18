"use strict";
// config/routes/

var props = require('../properties');

module.exports = function(server, ctrl) {

    // Passport Auth
    require('./auth_routes')(server, ctrl, props);

    // Views
    require('./view_routes')(server, ctrl, props);

    // AJAX
    require('./ajax_routes')(server, ctrl);

    // REST API
    require('./api_routes')(server, ctrl);

    // Wildcard Route (404 error)
    server.get('/*', function(req, res, next) {
        res.status(404)
            .format({
                'text/plain': function() {
                    res.redirect('/');
                },

                'text/html': function() {
                    res.redirect('/');
                },

                'application/json': function() {
                    res.json(undefined);
                }
            });
    });

};