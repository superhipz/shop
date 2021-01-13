const path = require('path');

const migrations = {
    directory: path.join(__dirname, 'migrations')
};

const seeds = {
    directory: path.join(__dirname, 'seeds')
};

const baseConfig = {
    client: 'pg',
    version: '11.3'
};

const connection = {
    host: 'localhost',
    user: 'adsteam_user',
    password: 'adsteam_pwd',
    database: 'adsteam_dev',
    port: '5432'
};

module.exports = {
    development: {
        ...baseConfig,
        connection,
        pool: {
            min: 1,
            max: 3
        }
    },
    onUpdateTrigger: (table) => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();`
};
