"use strict";
// config/routes/ajax_routes.js


module.exports = function(server, ctrl) {

    // ================= AJAX NAVIGATION

    // STEPS VIEW
    server.get('/ajax/steps/:step', function(req, res, next) {
        var stepNbr = req.params.step;

        ctrl.getRoles(function(err, data) {
            if (err) return next(err);
            if (stepNbr === '1' || stepNbr === '2')
                res.render('ajax/steps/roles', {
                    "roles": data
                });
            else // 3
                res.render('ajax/steps/step' + stepNbr);
        });
    });

    // PROFILE VIEWS
    server.get('/ajax/profile/:view', ctrl.isLoggedIn, function(req, res, next) {
        var user = req.user.account,
            profile = req.user.profile,
            viewName = req.params.view;

        res.render('ajax/profile/' + viewName, {
            'user': user,
            'profile': profile,
            'avatar': user.getGravatar('400'),
            'thumbs': profile.getVotesPercents(5),
            'rating': profile.getRating()
        });
    });

    // ================= AJAX VALIDATION

    // USERNAME VALIDATION
    server.get('/ajax/validate/username/:username', function(req, res, next) {
        var username = req.params.username;

        ctrl.checkUsername(username, function(err, user) {
            if (err) return next(err);
            if (user) return res.json({
                'ok': false
            }); // username already used
            res.json({
                'ok': true
            }); // username available
        });
    });

};