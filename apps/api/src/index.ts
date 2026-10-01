import path = require('path');
import dotenv = require('dotenv');

// Import-equals (not `import X from 'Y'`) throughout this file deliberately:
// it compiles to a positional require(), preserving the exact load order the
// original required — dotenv.config() must run before `./config/env` is
// required, since env.ts reads process.env at module-load time. A plain ES
// `import` risks being hoisted ahead of the dotenv.config() call below.
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

import env = require('./config/env');
import app = require('./app');

app.listen(env.PORT, () => {
  console.log(`[API] Server running on port ${env.PORT} (${env.NODE_ENV})`);
});
