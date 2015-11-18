"use strict";
// app/models/account.js

var props = {
    database: 'user',
    collection: 'accounts',
    model: 'Account'
};

var bcrypt = require('bcrypt-nodejs'),
    uuid = require('node-uuid'),
    gravatar = require('gravatar');


module.exports = function(mongoose, Profile) {
    // connect to 'User' database
    var db = mongoose.get(props['database']);

    /* ====================== SCHEMA ====================== */

    // Account schema
    var accountSchema = mongoose.Schema({

        // User account
        local: {
            // username + email are automatically filled from other signup methods
            username: {
                type: String,
                lowercase: true,
                trim: true
            },
            email: String,
            password: { // 3-level crypted password for maximum security (client>passport>mongoose)
                type: String,
                default: "" // empty passwords can be set in account page
            },
            passwordLastChanged: { // Last time password was updated by user
                type: Date,
                default: null
            }
        },

        // Linked Social accounts
        facebook: {
            id: String,
            token: String,
            email: String,
            name: String
        },
        google: {
            id: String,
            token: String,
            email: String,
            name: String
        },

        // API authentication key
        apikey: {
            type: String,
            unique: true,
            required: true
        },

        // Account type: regular user, premium user or admin
        type: {
            type: String,
            default: 'regular'
        },

        // Date of user model creation
        joinDate: {
            type: Date,
            default: Date.now
        },
        // Date of last time user logged-in
        lastLogged: {
            type: Date,
            default: Date.now
        },
        // Date of last time user interacted with website
        lastAccess: {
            type: Date,
            default: Date.now
        },
        // Invisible mode {false:'inactive', true:'active'}
        hidden: {
            type: Boolean,
            default: false
        }
    }, {
        safe: true,
        collection: props['collection']
    });


    /* ====================== STATICS ====================== */

    // Generate hash for password
    accountSchema.statics.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };


    /* ====================== METHODS ====================== */

    // Check if password is valid
    // @param password: password to validate
    accountSchema.methods.validPassword = function(password) {
        return bcrypt.compareSync(password, this.local.password);
    };

    // Update api key for security and save document
    accountSchema.methods.updateApiKey = function(fn) {
        this.apikey = uuid.v4();
        this.lastAccess = new Date();
        this.save(fn);
    };

    // If user is still in his first month on the website
    accountSchema.methods.isFirstMonth = function() {
        var one_day = 1000 * 60 * 60 * 24;
        if (Math.round(((new Date()).getTime() - this.joinDate.getTime()) / one_day) <= 30)
            return true;
        return false;
    };

    // Get gravatar URL for user email
    // @param size: gravatar image size
    accountSchema.methods.getGravatar = function(size) {
        return gravatar.url(this.local.email, {
            s: size,
            r: 'pg',
            d: 'monsterid' // mystery-man
        });
    };


    return db.model(props['model'], accountSchema);
};