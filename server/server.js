const koa = require('koa')
const send = require('koa-send');
const router = require('koa-joi-router')()

const app = new koa()

// routes
var apiPath = '/api'
const routes = require('./routes.js').routes(apiPath)

// logger
var logger = require('./logger.js').getLogger('server')

app.use(async function (ctx, next) {
  logger.info('%s', `${ctx.method} ${ctx.url} - received`);
  const start = new Date();
  await next();
  const ms = new Date() - start;
  logger.info('%s', `${ctx.method} ${ctx.url} - ${ms}ms`);
})
app.use(async (ctx, next) => {
  if (ctx.path.indexOf('/static') != 0) {
    await next()
  } else {
    await send(ctx, ctx.path);
  }
})
app.use(router.middleware())

router.route(routes)

logger.info('------ Starting appliation ------')
app.listen(3000, function () {
  logger.info('Application listening on %d', 3000)
})

app.on('error', (err, ctx) =>
  logger.error('Server error', err, ctx)
)