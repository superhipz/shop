const { onUpdateTrigger } = require('../knexfile');

exports.up = (knex) => {
    return knex.schema.createTable('verifications', (table) => {
        table.increments();

        table.boolean('phone_verified').defaultTo(false);
        table.boolean('email_verified').defaultTo(false);
        table.boolean('google_verified').defaultTo(false);
        table.boolean('facebook_verified').defaultTo(false);

        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('id').inTable('users');

        table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
        table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
        table.timestamp('deleted_at');
    }).then(() => knex.raw(onUpdateTrigger('verifications')));
};

exports.down = (knex) => {
    return knex.schema.dropTable('verifications');
};
