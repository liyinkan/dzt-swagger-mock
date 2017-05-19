
// logger
var logger = require('../logger.js').getLogger('handle-list')

var fs = require('fs')
var swig = require('swig')

exports.handle = function () {
	var data = JSON.parse(fs.readFileSync("swagger/swagger.json"))
	var tpl = swig.compileFile('tpl/list.html')
	return tpl({
		basePath: data.basePath,
		paths: data.paths
	})
}