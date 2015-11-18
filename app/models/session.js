"use strict";
// app/models/session.js

var props = {
    database: 'chat',
    collection: 'sessions',
    model: 'Session'
};

module.exports = function(mongoose) {
    var db = mongoose.get(props['database']);

    // SCHEMA ======================
    var sessionSchema = mongoose.Schema({

        startTime: {
            type: Date,
            default: Date.now
        },
        duration: {
            type: Number,
            min: 180, // 3 min
            max: 600, // 10 min
            default: 180
        },
        access: {
            type: String,
            default: 'private'
        },
        userIn: {
            type: mongoose.Schema.Types.ObjectId
        },
        userOut: {
            type: mongoose.Schema.Types.ObjectId
        },
        conversation: [{
            time: Date,
            text: String,
            sender: mongoose.Schema.Types.ObjectId
        }]
    }, {
        safe: true,
        collection: props['collection']
    });

    // METHODS ======================


    return db.model(props['model'], sessionSchema);
};