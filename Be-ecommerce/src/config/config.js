require('dotenv').config();

const dialect = process.env.DATABASE_DIALECT || 'postgres';

const commonConfig = {
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  logging: false,
  dialect: dialect,
  dialectOptions:
    process.env.DATABASE_SSL === 'true' || process.env.DATABASE_SSL === true
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
};

if (dialect === 'sqlite') {
  commonConfig.storage = process.env.DATABASE_STORAGE || './database.sqlite';
}

module.exports = {
  development: commonConfig,
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: commonConfig,
};