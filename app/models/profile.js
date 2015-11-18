"use strict";
// app/models/profile.js

var props = {
    database: 'user',
    collection: 'profiles',
    model: 'Profile'
};


module.exports = function(mongoose) {
    // connect to 'User' database
    var db = mongoose.get(props['database']);

    /* ====================== SCHEMA ====================== */

    // Profile schema
    var profileSchema = mongoose.Schema({

        // Account ID
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true
        },

        // First-time login
        firstTime: {
            type: Boolean,
            default: true
        },

        // Role
        role: {
            title: {
                type: String,
                default: 'person'
            },
            name: {
                type: String,
                default: ''
            },
            picture: {
                type: String,
                default: '/img/roles/default.png'
            },
            live: {
                type: Boolean,
                default: true
            }
        },

        // Rating (number of good/bad votes)
        thumbsUp: {
            type: Number,
            default: 0
        },
        thumbsDown: {
            type: Number,
            default: 0
        },

        // List of Badges/Honors gained
        badges: [{
            badge: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Badge' // http://mongoosejs.com/docs/populate.html
            },
            unlocked: {
                type: Date
            }
        }],

        // List of Reviews received
        reviews: [{
            title: {
                type: String
            },
            content: {
                type: String
            },
            received: {
                type: Date,
                default: Date.now
            },
            thumb: {
                type: Boolean // true = up, false = down
            }
        }]

    }, {
        safe: true,
        collection: props['collection']
    });


    /* ====================== STATICS ====================== */


    /* ====================== METHODS ====================== */

    // Get votes percentages for View
    // @param empty: default percent on both ratings if no votes yet (5%)
    profileSchema.methods.getVotesPercents = function(empty) {
        var sum = this.thumbsUp + this.thumbsDown;

        if (sum === 0) return {
            'up': empty,
            'down': empty
        };

        return {
            'up': Math.round(this.thumbsUp * 100 / sum),
            'down': Math.round(this.thumbsDown * 100 / sum)
        };
    };

    // Calculate user's rating
    // based on number of votes, reviews, last activity...
    // @return: (worst) 1 -> 5 (best)
    profileSchema.methods.getRating = function() {
        var thumbs = this.getVotesPercents(0);

        if (thumbs.down === thumbs.up && thumbs.up === 0)
            return 0; // neutral
        if (thumbs.down >= 90)
            return 1;
        if (thumbs.down >= 60)
            return 2;
        if (thumbs.down > 40)
            return 3;
        if (thumbs.down > 10)
            return 4;
        return 5; // best
    };


    return db.model(props['model'], profileSchema);
};