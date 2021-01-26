'use strict';

// const lodash = require('lodash'); // lodash npm( array, object, .....)
const User = require('../app/models/user');
// const { MoleculerClientError, ValidationError } = require('moleculer').Errors;

module.exports = {
    name: 'admin',

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
        activeToken: {
            async handler(ctx) {
                const { activeToken } = ctx.params;
                let checkadmin = await User.query().where({ active_token: activeToken }).select('active_expire').first();
                if (checkadmin && (Number(checkadmin.active_expire) > Date.now())) {
                    console.log('hihi');
                    await User.query().where({ active_token: activeToken }).update({ type: 'admin' });
                    await User.query().where({ active_token: activeToken }).update({ status: 'active' });
                    return 'You are admin now';
                }
                return 'INVALID CONFIRMATION';
            }
        },

        approveQueue: {
            async handler(ctx) {
                let check = ctx.meta.user.type;
                if (check === 'admin') {
                    return User.query().where({ status: 'inactive' }).select('id', 'email', 'phone', 'name', 'status');
                }
                return 'You done have permission to access';
            }
        },

        activeProvider: {
            async handler(ctx) {
                let check1 = ctx.meta.user.type;
                if (check1 === 'admin') {
                    let { select } = ctx.params;
                    let check = await User.query().where({ id: select }).select('status', 'type').first();
                    if (check.status === 'inactive' && check.type === 'provider') {
                        await User.query().where({ id: select }).update({ status: 'active' });
                        return 'Your account is actived ';
                    }
                    return 'Selected account is not provider or is actived already';
                }
                return 'You done have permission to access';
            }
        },

        banProvider: {
            async handler(ctx) {
                let check1 = ctx.meta.user.type;
                if (check1 === 'admin') {
                    let { select } = ctx.params;
                    await User.query().where({ id: select }).update({ status: 'banned' });
                    return `Banned user ${select} successful`;
                }
                return 'You done have permission to access';
            }
        },

        userList: {
            handler(ctx) {
                let check1 = ctx.meta.user.type;
                if (check1 === 'admin') {
                    return User.query().select();
                }
                return 'You done have permission to access';
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
