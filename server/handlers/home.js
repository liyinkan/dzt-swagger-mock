
// logger
var logger = require('../logger.js').getLogger('handle-home')

var swig = require('swig')

exports.handle = function (ctx) {
	var tpl = swig.compileFile('tpl/home.html')
	return tpl({})
}