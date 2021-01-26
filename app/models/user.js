'use strict';

const lodash = require('lodash');
const { Model } = require('objection');
const knex = require('../../config/database');
const { TokenHandler } = require('../helpers/jwt-token');
const CustomQueryBuilder = require('../helpers/custom_query_builder');

// Bcrypt functions used for hashing password and later verifying it.
const SALT_ROUNDS = 10;
const bcrypt = require('bcrypt');

class User extends Model {
    static get tableName() {
        return 'users';
    }

    static get softDelete() {
        return true;
    }

    static get selectableProps() {
        return ['id', 'email', 'name', 'status', 'phone', 'type', 'quantity', 'shop_name', 'shop_image', 'amount', 'active_token', 'active_expire'];
    }

    static get adminTypes() {
        return ['admin', 'supporter'];
    }

    static get organizationTypes() {
        return ['organization', 'dependent'];
    }

    static get personalTypes() {
        return ['normal'];
    }

    static get maxPageSize() {
        return 100;
    }

    static get deletedColumn() {
        return 'deleted_at';
    }

    static get QueryBuilder() {
        return CustomQueryBuilder;
    }

    static get settings() {
        return {
            regex: {
                password: /^[ -~]*$/,
                phoneNumber: /((09|03|07|08|05)+([0-9]{8})\b)/g
            }
        };
    }


    static hashPassword(password) {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    static comparePassword(password, hashPassword) {
        return bcrypt.compare(password, hashPassword);
    }

    static generateToken(user) {
        // Create token
        let token = TokenHandler.generateJWT(user);
        return {
            user: lodash.pick(user, ['id', 'name', 'email', 'amount', 'type', 'status', 'phone', 'itemInCart']), // thêm thông tin đc chọn vào user
            token
        };
    }

    static register(user) {
        if (!user.password) return this.query().insert(user);
        return User.hashPassword(user.password).then(hashed => {
            return this.query().insert({
                ...user,
                password: hashed
            });
        });
    }
}

User.knex(knex);

module.exports = User;
