'use strict';

// const lodash = require('lodash'); // lodash npm( array, object, .....)
const User = require('../app/models/user');
const Prod = require('../app/models/product');
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
        shopInfo: {
            handler(ctx) {
                return User.query()
                    .where({ id: ctx.meta.user.id }).select('shop_name', 'shop_image', 'id').first();
            }
        },

        createShop: {
            params: {
                shopName: { type: 'string', max: 255 }
            },
            async handler(ctx) {
                let { shopName } = ctx.params;
                let { shopImage } = ctx.params;
                await User.query().where({ id: ctx.meta.user.id }).update({
                    shop_name: shopName,
                    shop_image: shopImage
                });
                return User.query().where({ id: ctx.meta.user.id }).select('shop_name', 'shop_image');
            }
        },

        importItem: {
            params: {
                name: { type: 'string', min: 2, max: 255 },
                category: { type: 'enum', values: ['fashion', 'electronic devices', 'entertainment', 'vehicle'] },
                price: { type: 'string' },
                description: { type: 'string', min: 2 }
            },
            async handler(ctx) {
                if (ctx.meta.user.status === 'banned') {
                    return 'Your account have been banned';
                }
                // if (ctx.meta.user.status === 'inactive') {
                //     return 'Your account is not actived';
                // }
                let email = ctx.meta.user.email;
                let name = ctx.params.name;
                let category = ctx.params.category;
                let price = ctx.params.price;
                let itemImage = ctx.params.itemImage;
                let brand = ctx.params.brand;
                let location = ctx.params.location;
                let quantity = ctx.params.quantity;
                let description = ctx.params.description;
                // eslint-disable-next-line camelcase
                let user_id = ctx.meta.user.id;
                const newProd = {
                    email,
                    user_id,
                    name,
                    category,
                    price,
                    brand,
                    location,
                    quantity,
                    description,
                    itemImage
                };
                await Prod.query().insert(newProd);
                return newProd;
            }
        },

        itemList: {
            params: {

            },
            handler(ctx) {
                return Prod.query().where({ user_id: ctx.meta.user.id }).select('id', 'email', 'user_id', 'name', 'category', 'price', 'quantity', 'description', 'brand', 'location', 'itemImage').whereNotDeleted();
            }
        },

        deleteItem: {
            params: {

            },
            handler(ctx) {
                let { selectedId } = ctx.params;
                return Prod.query().where({ id: selectedId }).del();
            }
        },

        editItem: {
            params: {
                name: { type: 'string', min: 2, max: 255 },
                category: { type: 'enum', values: ['fashion', 'electronic devices', 'entertainment', 'vehicle'] },
                price: { type: 'string' },
                description: { type: 'string', min: 2 }
            },
            async handler(ctx) {
                let { selectedId } = ctx.params;
                if (ctx.meta.user.status === 'banned') {
                    return 'Your account have been banned';
                }
                // if (ctx.meta.user.status === 'inactive') {
                //     return 'Your account is not actived';
                // }
                let name = ctx.params.name;
                let category = ctx.params.category;
                let price = ctx.params.price;
                let itemImage = ctx.params.itemImage;
                let brand = ctx.params.brand;
                let location = ctx.params.location;
                let quantity = ctx.params.quantity;
                let description = ctx.params.description;
                // eslint-disable-next-line camelcase
                const fixedProd = {
                    name,
                    category,
                    price,
                    brand,
                    location,
                    quantity,
                    description,
                    itemImage
                };
                await Prod.query().where({ id: selectedId })
                    .update({
                        // eslint-disable-next-line max-len
                        name: name, category: category, price: price, brand: brand, location: location, quantity: quantity, description: description, itemImage: itemImage
                    });
                return fixedProd;
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
