'use strict';

const { Model } = require('objection');
const knex = require('../../config/database');
const CustomQueryBuilder = require('../helpers/custom_query_builder');

class Product extends Model {
    static get tableName() {
        return 'products';
    }

    static get softDelete() {
        return true;
    }

    static get selectableProps() {
        return ['id', 'provider_id', 'email', 'name', 'category', 'price', 'quantity', 'description', 'brand', 'location', 'itemImage'];
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
}

Product.knex(knex);

module.exports = Product;
