const config = {
    development: {
        PORT: 5000,
        DB_CONNECTION: 'mongodb://localhost/tutorials',
        SALT_ROUNDS: 1,
        SECRET: 'secret',
        USER_SESSION: 'U_S',
    },
    production: {
        PORT: 80,
    },
};

module.exports = config[process.env.NODE_ENV.trim()];
