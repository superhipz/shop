'use strict';

// const lodash = require('lodash'); // lodash npm( array, object, .....)
const User = require('../app/models/user');
// const { MoleculerClientError, ValidationError } = require('moleculer').Errors;
// const { AuthenticationError } = require('../app/helpers/errors');
module.exports = {
    name: 'provider',

    /**
     * Service settings
     */
    settings: {

    },

    /**
     * Service dependencies
     */
    // dependencies: [],

    /**
     * Actions
     */
    actions: {
        dashboard: {
            handler(ctx) {
                return User.query()
                    .where({ id: ctx.meta.user.id });
            }
        },

        importItem: {
            async handler(ctx) {
                if (ctx.meta.user.status === 'banned') {
                    return 'Your account have been banned';
                }
                if (ctx.meta.user.status === 'inactive') {
                    return 'Your account is not actived';
                }
                let number = ctx.params.number;
                await User.query()
                    .where({ id: ctx.meta.user.id })
                    .increment('quantity', number);
                return `You have imported ${number} item`;
            }
        }

    },

    /**
     * Events
     */
    events: {

    },

    /**
     * Methods
     */
    methods: {

    },

    /**
     * Service created lifecycle event handler
     */
    created() {
        global.Promise = this.Promise;
    },

    /**
     * Service started lifecycle event handler
     */
    started() {

    },

    /**
     * Service stopped lifecycle event handler
     */
    stopped() {

    }
};
