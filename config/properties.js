// config/properties.js

module.exports = {

    PORT: process.env.PORT || 8080,
    ENV: process.env.NODE_ENV || "production",

    SECRET: "duderoleswitchisthebestappeverohmygodicantbelieveit", // TODO
    COOKIES: {
        session: 'rs.sid',
        token: 'rs.tkn'
    },
    ROLLBAR: {
        client: '7d9924773c9a448aac37a187e2c9a487',
        server: 'bd06ab5d60ee460a838ecbdb79834227'
    },

    DEV: {
        STATIC: 'public/dev',
        facebook: {
            clientID: '513849435394695',
            clientSecret: '2f6207f0203ba1d10b2109aeebfa1dd4',
            callbackUrl: 'http://localhost:8080/auth/facebook/callback'
        },
        google: {
            clientID: '160480800316-lpvm81mlesdntpa4fph7cb2o5b4rqb3c.apps.googleusercontent.com',
            clientSecret: 'O19N3SN4_SwgHI8qsPSKni5T',
            callbackUrl: 'http://localhost:8080/auth/google/callback'
        },
        DB: {
            user: 'mongodb://127.0.0.1:27017/user',
            store: 'mongodb://127.0.0.1:27017/store',
            chat: 'mongodb://127.0.0.1:27017/chat'
        }
    },
    PROD: {
        STATIC: 'public/dev',
        facebook: {
            clientID: '1422379521354199',
            clientSecret: '4ebe9d158053cf5f8c148fdae0923788',
            callbackUrl: 'http://chat.roleswitch.com/auth/facebook/callback'
        },
        google: {
            // +page id: 109991304407561949433
            clientID: '373034642620-5p90r9j470hi3iltefiq1hmopbi6vmm9.apps.googleusercontent.com',
            clientSecret: 'j5OGyPmaaQJenIgC-Vpeya_p',
            callbackUrl: 'http://chat.roleswitch.com/auth/google/callback'
        },
        DB: {
            user: 'mongodb://roleswitch:roleswitchpasswordqp@ds029979.mongolab.com:29979/user',
            store: 'mongodb://roleswitch:roleswitchpasswordqp5@ds063287.mongolab.com:63287/store',
            chat: 'mongodb://roleswitch:roleswitchpasswordqp@ds033459.mongolab.com:33459/chat'
        }
    }
};