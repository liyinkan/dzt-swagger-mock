
// logger
var logger = require('../logger.js').getLogger('handle-refresh')

var rquestSync = require('request-promise')
var fs = require('fs')

exports.handle = function (query) {
	if (query && query.url) {
		var options = {
			uri: query.url
		}
		rquestSync(options)
			.then(function (data) {
				logger.info('Get json data from url: %s', query.url)
				var swagger = JSON.parse(data)
				logger.info('Swagger data saved to: %s', "swagger/swagger.json")
				if (!fs.existsSync('swagger')) {
					fs.mkdirSync('swagger')
				}
				fs.writeFileSync("swagger/swagger.json", data)
			})
			.catch(function (err) {
				logger.error('Get json error %s, %s', query.url, err)
			})
	}
	return ['<p>Auto refresh after 2s...</p><script>setTimeout(function() {',
		'window.location = "list"',
		'}, 2000);</script>'].join('')
}