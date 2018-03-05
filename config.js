module.exports = {
  port: process.env.PORT || 3000,
  db:  process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/recaudia',
  driver: 'postgres'
};