
// logger
var logger = require('../logger.js').getLogger('handle-mock')

var fs = require('fs')

var addFolder = function (currentPath) {
	if (!fs.existsSync(currentPath)) {
		logger.debug('Folder not found and make it: %s', currentPath)
		fs.mkdirSync(currentPath)
	} else {
		logger.debug('Folder found: %s', currentPath)
	}
}

var saveJsonData = function (path, method, data) {
	var filePath = path + '/' + method.toLowerCase() + '.json'
	fs.writeFileSync(filePath, data)
}

exports.handle = function (ctx) {
	logger.info('Mock base path: %s', ctx.basePath)
	logger.info('Mock path: %s', ctx.path)
	logger.info('Mock method: %s', ctx.method)
	logger.debug('Mock json: %s', ctx.data)
	if (!ctx.path) {
		logger.error('Path not found')
	} else {
		var folderList = ctx.path.split('/')
		var currentPath = 'data'
		addFolder(currentPath)
		folderList.forEach(function (value, index) {
			if (value) {
				currentPath = currentPath + '/' + value
				addFolder(currentPath)
			}
		})
		saveJsonData(currentPath, ctx.method, ctx.data)
	}
	return '<script>window.location="detail?path=' + ctx.path + '"</script>'
}