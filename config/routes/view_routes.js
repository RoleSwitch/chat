"use strict";
// config/routes/view_routes.js


module.exports = function(server, ctrl, props) {

    // ================= WITHOUT AUHTENTICATION
    // ROOT VIEW
    // redirect to /home if user logged-in
    server.get('/', function(req, res) {
        if (req.isAuthenticated())
            return res.redirect('/home');
        else res.render('index', {
            'env': props.ENV,
            'rollbar_token': props.ROLLBAR.client
        });
    });

    // TERMS
    server.get('/terms', function(req, res) {
        res.render('terms', {
            'env': props.ENV,
            'rollbar_token': props.ROLLBAR.client
        });
    });

    // ================= WITH AUHTENTICATION

    server.get('/home', ctrl.isLoggedIn, function(req, res, next) {
        var user = req.user.account,
            profile = req.user.profile;

        ctrl.getRoles(function(err, roles) {
            if (err) return next(err);
            res.render('home', {
                'env': props.ENV,
                'rollbar_token': props.ROLLBAR.client,
                'user': user.toObject(),
                'profile': profile.toObject(),
                'avatar': user.getGravatar('400'),
                'thumbs': profile.getVotesPercents(5),
                'rating': profile.getRating(),
                'roles': roles
            });
        });
    });

    server.get('/profile', ctrl.isLoggedIn, function(req, res, next) {
        var user = req.user.account,
            profile = req.user.profile;

        res.render('profile', {
            'env': props.ENV,
            'rollbar_token': props.ROLLBAR.client,
            'user': user.toObject(),
            'profile': profile.toObject(),
            'avatar': user.getGravatar('400'),
            'thumbs': profile.getVotesPercents(5),
            'rating': profile.getRating()
        });
    });

    server.get('/account', ctrl.isLoggedIn, function(req, res, next) {
        var user = req.user.account,
            profile = req.user.profile;

        res.render('account', {
            'env': props.ENV,
            'rollbar_token': props.ROLLBAR.client,
            'user': user.toObject(),
            'profile': profile.toObject()
        });
    });

};