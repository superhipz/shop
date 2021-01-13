'use strict';

// const lodash = require('lodash'); // lodash npm( array, object, .....)
const User = require('../app/models/user');
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
            handler() {
                return User.query()
                    .where({ type: 'provider' })
                    .select('email', 'phone', 'first_name', 'quantity');
            }
        },

        dashboard: {
            handler(ctx) {
                return User.query().where({ id: ctx.meta.user.id });
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
            async handler(ctx) {
                let { select } = ctx.params;
                let selectType = await User.query().where({ id: select }).select('type').first();
                if (selectType.type === 'provider') {
                    let { quantityBuy } = ctx.params; // Quantity want to buy
                    let moneyPay = 15000 * quantityBuy; // Amount of money need to pay

                    let quantity = await User.query().where({ id: select }).select('quantity').first(); // Quantity of that provider at the moment
                    let amountCusHave = await User.query().where({ id: ctx.meta.user.id }).select('amount').first(); // Amount of money user is having
                    if (quantityBuy > quantity.quantity || amountCusHave.amount < moneyPay) {
                        return 'Kiem tra lai so tien ban co hoac so luong ban nhap vao';
                    }
                    await User.query().where({ id: ctx.meta.user.id }).decrement('amount', moneyPay); // Descrease money of customer
                    await User.query().where({ id: select }).decrement('quantity', Number(quantityBuy)); // Descrease number of item (provider)
                    await User.query().where({ id: select }).increment('amount', moneyPay); // Increase money of provider
                    return `You have buy ${Number(quantityBuy)} item cost ${moneyPay} VND`;
                }
                return 'This user is not a provider';
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
