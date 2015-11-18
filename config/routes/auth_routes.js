"use strict";
// config/routes/auth_routes.js


module.exports = function(server, ctrl, props) {

    // LOGIN
    server.post('/login', function(req, res, next) { // authenticate middleware

        ctrl['auth'].authenticate('login', function(err, user, info) {
            if (err) return next(err);
            if (!user) {
                console.log("AUTH> failed login request: " + JSON.stringify(req.body));
                res.status(401);
                return next(new Error(req.flash('loginMessage')));
            }

            // session registering
            req.login(user, function(err) {
                if (err) return next(err);
                return next();
            });
        })(req, res, next);

    }, function(req, res, done) { // remember me middlware
        if (req.body.rememberme === "no") {
            ctrl.clearRememberMeToken(req.signedCookies[props.COOKIES['token']], function(token) {
                res.clearCookie(props.COOKIES['token']);
                return res.json({
                    ok: true
                });
            });
        } else { // a new token is generated
            ctrl.setRememberMeToken(req.user.id, function(err, token) {
                if (err) return done(err);
                res.cookie(props.COOKIES['token'], token.id, {
                    path: '/',
                    httpOnly: true,
                    signed: true,
                    maxAge: 30 * 86400000
                }); // 30 days
                console.log("AUTH> new token created for user " + req.user.id + ": " + token.id);
                return res.json({
                    ok: true,
                    remember: true
                });
            });
        }
    });

    // SIGNUP
    server.post('/signup', function(req, res, next) {
        ctrl['auth'].authenticate('signup', function(err, user, info) {
            if (err) return next(err);
            if (!user) {
                return res.json({
                    ok: false,
                    message: req.flash('signupMessage')
                });
            }
            req.login(user, function(err) {
                if (err) {
                    return next(err);
                }
                return res.json({
                    ok: true
                });
            });
        })(req, res, next);
    });

    // FACEBOOK ROUTES
    // route for facebook authentication and login
    server.get('/auth/facebook',
        ctrl['auth'].authenticate('facebook', {
            scope: 'email'
        }));
    // handle the callback after facebook has authenticated the user
    server.get('/auth/facebook/callback',
        ctrl['auth'].authenticate('facebook', {
            successRedirect: '/home',
            failureRedirect: '/'
        }));


    // GOOGLE ROUTES
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    server.get('/auth/google',
        ctrl['auth'].authenticate('google', {
            scope: ['profile', 'email']
        }));
    // the callback after google has authenticated the user
    server.get('/auth/google/callback',
        ctrl['auth'].authenticate('google', {
            successRedirect: '/home',
            failureRedirect: '/'
        }));


    // LOGOUT
    server.get('/logout', ctrl.isLoggedIn, function(req, res) {
        var token = req.signedCookies[props.COOKIES['token']];
        var id = req.user.account.id;

        // clear the remember me cookie when logging out
        ctrl.clearRememberMeToken(token, function(token) {
            res.clearCookie(props.COOKIES['token']);
            req.logout();

            console.log("AUTH> user " + id + " logged out")
            res.redirect('/');
        });
    });

};