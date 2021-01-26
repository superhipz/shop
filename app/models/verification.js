'use strict';

const { Model } = require('objection');
const knex = require('../../config/database');
const CustomQueryBuilder = require('../helpers/custom_query_builder');
const { TokenHandler } = require('../../app/helpers/jwt-token');

class Verification extends Model {
    static get tableName() {
        return 'verifications';
    }

    static get QueryBuilder() {
        return CustomQueryBuilder;
    }

    static get selectableProps() {
        return ['email_verified', 'facebook_verified', 'google_verified', 'phone_verified'];
    }

    static get providers() {
        return {
            GOOGLE: {
                handler: TokenHandler.verifyOauthGoogle,
                verifiedProps: 'google_verified'
            },
            FACEBOOK: {
                handler: TokenHandler.verifyOauthFacebook,
                verifiedProps: 'facebook_verified'
            }
        };
    }

    // static verify(userID, provider) {
    //     return this.query().where({ user_id: userID }).patch({ [provider.verifiedProps]: true });
    // }
}

Verification.knex(knex);

module.exports = Verification;
