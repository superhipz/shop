const { onUpdateTrigger } = require('../knexfile');

exports.up = (knex) => {
    return knex.schema.createTable('users', (table) => {
        table.increments();

        table.string('email').unique().notNullable();
        table.string('phone', 40).nullable().unique();
        table.string('name').notNullable();
        table.string('status').defaultTo('inactive'); // active, inactive
        table.integer('amount').defaultTo('0');
        table.string('password').notNullable();
        table.string('shop_name').nullable();
        table.string('shop_image').nullable();
        table.integer('quantity').defaultTo('0');
        table.integer('itemInCart').defaultTo('0');
        table.enu('type', ['provider', 'customer', 'admin']).notNullable();
        table.string('active_token');
        table.string('active_expire');
        table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
        table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
        table.timestamp('deleted_at');
    }).then(() => knex.raw(onUpdateTrigger('users')));
};

exports.down = (knex) => {
    return knex.schema.dropTable('users');
};
