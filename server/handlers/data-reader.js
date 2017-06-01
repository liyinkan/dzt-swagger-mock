
var fs = require('fs')

// logger
var logger = require('../logger.js').getLogger('handle-data-reader')

var getCurrentData = function (method, path) {
	var path = path.split('?')[0]
	var file = 'data' + path + '/' + method.toLowerCase() + '.json'
	var res = null
	logger.debug('Finding mock data: %s', file)
	if (fs.existsSync(file)) {
		logger.debug('Found mock data: %s', file)
		res = JSON.parse(fs.readFileSync(file).toString())
	}
	return res
}

exports.handle = function (method, path) {
	return getCurrentData(method, path)
}