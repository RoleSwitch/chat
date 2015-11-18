"use strict";
// config/settings.js

var consolidate = require('consolidate'),
    i18n = require('i18n'),
    helmet = require('helmet'),
    flash = require('connect-flash'),
    rollbar = require('rollbar');

var props = require('./properties');


module.exports = function(express, server, mongoose, passport, socketCallback) {

    // ROLLBAR init
    var rollbar_options = {
        environment: props.ENV,
        handler: "setInterval",
        handlerInterval: 5,
        root: "roleswitch-chat/",
        branch: 'master'
    };
    rollbar.init(props.ROLLBAR.server, rollbar_options);

    var MongoStore = require('connect-mongo')(express),
        sessionStore = new MongoStore({
            //url: props[(props.ENV === 'development'?'DEV':'PROD')].DB['store'],
            mongoose_connection: mongoose.get('store'),
            auto_reconnect: true
        });


    server.configure(function() {

        // all environments
        server.use(express.compress());
        server.use(express.favicon('public/favicon.png'));
        server.use(express.cookieParser(props['SECRET']));
        server.use(express.json());
        server.use(express.urlencoded());
        server.use(express.methodOverride());
        server.use(express.session({
            secret: props['SECRET'],
            // default store: new express.session.MemoryStore
            store: sessionStore,
            key: props.COOKIES['session'], // cookie name
            // cookie stays for one hour, even if browser is closed
            // cookie can become a browser only session, deleted after closing browser
            // if maxAge is set to null (default)
            //cookie: { maxAge: 60*60*1000 }// expires after one hour
        }));


        // SWIG render engine
        server.set('views', 'views');
        server.set('view engine', 'html');
        server.set('view options', {
            layout: true
        });
        server.engine('html', consolidate.swig);


        // front-end folder
        props['ENV'] === "development" ?
            server.use(express.static(props.DEV['STATIC'])) :
            server.use(express.static(props.PROD['STATIC'], {
                maxAge: 3 * 86400000 // cache: 3 days
            }));


        // i18n locales module
        // for multi-languages translation
        i18n.configure({
            locales: ['en', 'fr', 'ar'],
            directory: __dirname + '/locales',
            defaultLocale: 'en',
            cookie: 'lang'
        });
        // i18n init parses req for language headers, cookies, etc.
        server.use(i18n.init);


        // passport auth module middlewares
        // must be last one before router
        // for maximum request speed
        server.use(flash());
        server.use(passport.initialize());
        server.use(passport.session());
        server.use(passport.authenticate('remember-me'));


        // Use helmet to secure Express headers
        server.disable('x-powered-by');
        /*server.use(helmet.csp({
            'default-src': ["'self'"],
            'script-src': ["'self'", 'www.google-analytics.com', 'api.rollbar.com'],
            'img-src': ["'self'", 'www.gravatar.com'],
            'frame-src': ["'self'", 'youtube.com']
        }));*/
        server.use(helmet.xframe());
        server.use(helmet.iexss());
        server.use(helmet.contentTypeOptions());
        server.use(helmet.ienoopen());

        // routes
        props['ENV'] === "development" && server.use(express.logger('dev'));
        server.use(server.router);

        // DEVELOPMENT only
        if (props['ENV'] === "development") {
            // error handler
            server.use(express.errorHandler({
                dumpExceptions: true,
                showStack: true
            }));
        }

        // PRODUCTION only
        else {
            // Use the rollbar error handler to send exceptions to your rollbar account
            server.use(rollbar.errorHandler(props.ROLLBAR.server, rollbar_options));
            // error handler
            server.use(function(err, req, res, next) {
                if (err) console.log(err);
                res.redirect('http://www.roleswitch.com/500');
            });

            // catch the uncaught errors that weren't wrapped in a domain or try catch statement
            process.on('uncaughtException', function(err) {
                // handle the error safely
                console.log(err);
                rollbar.reportMessage(JSON.stringify(err));
            });
        }
    });

    // Disconnect databases/rollbar when stopping application
    process.on('SIGINT', function() {
        rollbar.shutdown();
        mongoose.get('chat').close(function() {
            mongoose.get('store').close(function() {
                mongoose.get('user').close(function() {
                    console.log("SERVER> process exit.");
                    process.exit(0);
                });
            });
        });
    });

    // global properties
    server.set('port', props['PORT']);

    // socket.io settings
    socketCallback(express, sessionStore);
};