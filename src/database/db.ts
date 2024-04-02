import knex from 'knex';
import knexConfig from '../../knexfile';

// Inicialize o knex.
const db = knex(knexConfig);

export default db;
