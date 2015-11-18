"use strict";
// app/models/role.js

var props = {
    database: 'chat',
    collection: 'roles',
    model: 'Role'
};

module.exports = function(mongoose) {
    var db = mongoose.get(props['database']);

    // SCHEMA ======================

    var roleSchema = mongoose.Schema({

        title: {
            type: String
        },
        picture: {
            type: String,
            default: 'public/img/roles/default.png'
        },
        restricted: {
            type: Boolean,
            default: false
        }
    }, {
        safe: true,
        collection: props['collection']
    });

    // METHODS ======================


    return db.model(props['model'], roleSchema);
};