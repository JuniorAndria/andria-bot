import { Knex } from 'knex';

export const up = (knex: Knex) => {
    return knex.schema.createTable('Guild', function (t) {
        t.bigInteger('Id').primary();
        t.dateTime('CreatedAt').notNullable().defaultTo(knex.fn.now());
        t.string('Prefix').notNullable().defaultTo('!');
        t.string('Name').notNullable();
        t.bigInteger('channelTextId').nullable();
    });
};

export const down = (knex: Knex) => {
    return knex.schema.dropTable('Guild');
};