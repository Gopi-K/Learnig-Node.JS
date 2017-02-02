var os = require('os');

// get the environment variable settings
var mariadbHost = process.env.EMANATE_MARIADB_HOST || '10.0.0.50';
var mariadbUser = process.env.EMANATE_MARIADB_USER || 'root';
var mariadbPassword = process.env.EMANATE_MARIADB_PASSWORD || 'Change123';
var mariadbDatabase = process.env.EMANATE_MARIADB_DATABASE || 'shopping_cart';

// define the database configuration
var dbConfig = {
  'mysql': {
    name: 'mysql',
    connectionLimit: 60,
    idleTimeout: 30000,
    host: mariadbHost,
    user: mariadbUser,
    password: mariadbPassword,
    database: mariadbDatabase,
    connectTimeout: 20000,
    multipleStatements: true,
    queryTimeout: 8000
  },
  'mariadb': {
    name: 'mariadb',
    maxConn: 10,
    minConn: 5,
    idleTimeout: 10000,
    host: mariadbHost,
    user: mariadbUser,
    password: mariadbPassword,
    db: mariadbDatabase,
    connTimeout: 15,
    multiStatements: true
  }
};

module.exports = dbConfig;
