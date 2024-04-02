import path from 'path';
const knexConfig = {
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'andria.sqlite'), // Substitua pelo caminho do seu arquivo de banco de dados SQLite
    },
    useNullAsDefault: true, // Necessário para SQLite
    migrations: {
        tableName: 'knex_migrations',
        directory: path.resolve(__dirname, 'src/database/migrations'), // Substitua pelo diretório de suas migrações
    },
};

export default knexConfig;
