require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
});

const env = require('./config/env');
const app = require('./app');

app.listen(env.PORT, () => {
  console.log(`[API] Server running on port ${env.PORT} (${env.NODE_ENV})`);
});
