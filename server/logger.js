
var log4js = require('log4js')

log4js.configure({
	appenders: [
		{ type: 'console' },
		{ type: 'file', filename: '../logs/logs.log', category: 'server' },
		{ type: 'file', filename: '../logs/logs.log', category: 'route-handler' }
	]
})

exports.getLogger = function (cls) {
	var logger = log4js.getLogger(cls)
	logger.setLevel('ALL')
	return logger
}