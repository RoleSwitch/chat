"use strict";
// app/models/badge.js

var props = {
    database: 'user',
    collection: 'badges',
    model: 'Badge'
};

module.exports = function(mongoose) {
    var db = mongoose.get(props['database']);

    // SCHEMA ======================

    var badgeSchema = mongoose.Schema({

        name: {
            type: String
        },
        description: {
            type: String,
            default: ""
        },
        picture: {
            type: String,
            default: 'public/img/badges/Newbie.png'
        },
    }, {
        safe: true,
        collection: props['collection']
    });

    // METHODS ======================

    return db.model(props['model'], badgeSchema);
};