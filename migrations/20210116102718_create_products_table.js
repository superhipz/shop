const { onUpdateTrigger } = require('../knexfile');

exports.up = (knex) => {
    return knex.schema.createTable('products', (table) => {
        table.increments();

        table.string('email').notNullable(); // email ng ba'n
        table.integer('user_id').unsigned();
        table.foreign('user_id').references('id').inTable('users');
        table.string('name').notNullable(); // ten san pham
        table.enu('category', ['fashion', 'vehicle', 'entertainment', 'electronic devices']).notNullable(); // phan loai sp
        table.string('price').notNullable();// gia' sp
        table.integer('quantity').notNullable(); // so luong sp
        table.string('description');
        table.string('brand');
        table.string('location');
        table.string('itemImage');
        table.integer('count').defaultTo('1');
        table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
        table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
        table.timestamp('deleted_at');
    }).then(() => knex.raw(onUpdateTrigger('products')));
};

exports.down = (knex) => {
    return knex.schema.dropTable('products');
};
