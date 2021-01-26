'use strict';

// const lodash = require('lodash'); // lodash npm( array, object, .....)
const User = require('../app/models/user');
const Prod = require('../app/models/product');

// const { MoleculerClientError, ValidationError } = require('moleculer').Errors;

module.exports = {
    name: 'customer',

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
        providerList: {
            params: {

            },
            handler() {
                return User.query()
                    .where({ type: 'provider' })
                    .select('id', 'email', 'phone', 'name', 'quantity', 'shop_name', 'shop_image');
            }
        },

        earnMoney: {
            async handler(ctx) {
                if (ctx.meta.user.type === 'customer' && ctx.meta.user.status === 'inactive') {
                    await User.query().where({ id: ctx.meta.user.id }).update({ status: 'active' });
                    await User.query().where({ id: ctx.meta.user.id }).update({ amount: '10000000' });

                    return 'Ban da nhan duoc 10.000.000 vao vi';
                }
                return 'Bạn không được phép nhận số tiền này do không phải khách hàng hoặc do bạn đã nhận trước đó rồi ';
            }
        },

        buyItem: {
            params: {

            },
            async handler(ctx) {
                let { totalMoneyToPay } = ctx.params;
                let { itemId } = ctx.params;
                let { shopId } = ctx.params;
                let currentMoneyAmount = ctx.meta.user.amount;
                let { quantityBuy } = ctx.params;
                if (totalMoneyToPay > currentMoneyAmount) {
                    return 'Không đủ tiền';
                }
                await User.query().where({ id: ctx.meta.user.id }).decrement('amount', totalMoneyToPay);
                await Prod.query().where({ id: itemId }).decrement('quantity', quantityBuy);
                await User.query().where({ id: shopId }).increment('amount', totalMoneyToPay);
                return 'OKEEE';
            }
        },

        productList: {
            handler(ctx) {
                return Prod.query().select('user_id', 'id', 'email', 'name', 'category', 'price', 'quantity', 'description', 'brand', 'location', 'itemImage', 'count').whereNotDeleted();
            }
        },

        userInfo: {
            handler(ctx) {
                return User.query().where({ id: ctx.meta.user.id }).select('email', 'id', 'amount', 'name', 'phone', 'status', 'type');
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
