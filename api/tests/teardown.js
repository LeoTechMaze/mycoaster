// Runs inside each test file's sandbox (registered via setupFilesAfterEnv), so
// it can close the very connections the routes opened in this module registry.
//
// globalTeardown.js cannot do this: it runs in Jest's parent process with a
// separate module registry, so the redis/firebase singletons it closes there
// are not the ones the tests actually connected. Those linger as open handles
// and keep the process alive ("Jest did not exit one second after...").
//
// Each test file still destroys its own Knex pool in its own afterAll.
afterAll(async () => {
  // ioredis: disconnect() is synchronous and disables reconnection. Unlike
  // quit(), it is a safe no-op when lazyConnect never opened the socket
  // (e.g. suites that never hit a redis-backed route).
  const redis = require('../src/config/redis');
  redis.disconnect();

  // firebase-admin keeps a native gRPC channel + token-refresh timer alive that
  // async_hooks can't surface, so --detectOpenHandles never flags it.
  const admin = require('firebase-admin');
  await Promise.all(admin.apps.map((app) => app && app.delete()));
});
