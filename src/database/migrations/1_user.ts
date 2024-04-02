import { Knex } from 'knex';

export const up = async (knex: Knex) => {
    return knex.schema.createTable('User', function (t) {
        t.bigInteger('Id').primary();
        t.dateTime('CreatedAt').notNullable().defaultTo(knex.fn.now());
        t.string('Username').notNullable();
        t.string('Language').notNullable().defaultTo('en');
        t.boolean('Banned').notNullable().defaultTo(false);
        t.boolean('Admin').notNullable().defaultTo(false);
    });
};

export const down = async (knex: Knex) => {
    return knex.schema.dropTable('User');
};
