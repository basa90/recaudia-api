const app = require('./app');
const chalk = require('chalk');
const config = require('./config');

app.listen(config.port, () => {
    console.log(`${chalk.green('[recaudia-api]')} API REST Corriendo`);
});