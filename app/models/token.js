"use strict";
// app/models/token.js

var props = {
    database: 'store',
    collection: 'tokens',
    model: 'Token',
    age: 30 // days
};


module.exports = function(mongoose) {
    // connect to 'User' database
    var db = mongoose.get(props['database']);

    /* ====================== SCHEMA ====================== */

    // Token schema
    var tokenSchema = new mongoose.Schema({

        created: {
            type: Date,
            default: Date.now
        },

        // User ID
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true // TODO: delete the other token when duplicate
        }

    }, {
        safe: true,
        collection: props['collection']
    });


    /* ====================== STATICS ====================== */

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    tokenSchema.statics.randomString = function(len) {
        var buf = [],
            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            charlen = chars.length;

        for (var i = 0; i < len; ++i) {
            buf.push(chars[getRandomInt(0, charlen - 1)]);
        }

        return buf.join('');
    };

    /* ====================== METHODS ====================== */

    // Invalidate the token if expired
    // Return UserId if still valid
    tokenSchema.methods.consume = function(fn) {
        var uid = this.uid;
        this.remove(function(err) {
            if (err) return fn(err, null);
            return fn(null, uid);
        });
    };


    return db.model(props['model'], tokenSchema);
};