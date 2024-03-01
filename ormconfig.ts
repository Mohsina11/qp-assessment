// ormconfig.js

module.exports = {
  type: 'mysql', // Change this to your database type
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'Secure@156',
  database: 'grocery',
  synchronize: false,
  logging: true,
  entities: ['./src/entities/*.js'], 
  migrations: ['./src/migrations/*.js'],
  migrationsRun: true,
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
  },
};
