
// logger
var logger = require('./logger.js').getLogger('routes')
var home = require('./handlers/home.js')
var refresh = require('./handlers/refresh.js')
var view = require('./handlers/list.js')
var detail = require('./handlers/detail.js')
var mock = require('./handlers/mock.js')
var reader = require('./handlers/data-reader.js')

exports.routes = function (basePath) {
	return [
		{
			method: ['POST', 'GET'],
			path: basePath + '/*',
			handler: async (ctx) => {
				var result = reader.handle(ctx.request.method, ctx.request.url.replace(basePath, ''))
				ctx.status = 200
				ctx.body = result;
			}
		},
		{
			method: 'GET',
			path: '/',
			handler: async (ctx) => {
				var result = home.handle()
				ctx.status = 200;
				ctx.body = result;
			}
		},
		{
			method: 'GET',
			path: '/refresh',
			handler: async (ctx) => {
				var result = refresh.handle(ctx.request.query)
				ctx.status = 200;
				ctx.body = result;
			}
		},
		{
			method: 'GET',
			path: '/list',
			handler: async (ctx) => {
				var result = view.handle()
				ctx.status = 200;
				ctx.body = result;
			}
		},
		{
			method: 'GET',
			path: '/detail',
			handler: async (ctx) => {
				var result = detail.handle(ctx.request.query)
				ctx.status = 200;
				ctx.body = result;
			}
		},
		{
			method: 'POST',
			path: '/mock',
			validate: { type: 'form' },
			handler: async (ctx) => {
				var result = mock.handle(ctx.request.body)
				ctx.status = 200;
				ctx.body = result;
			}
		}
	]
}