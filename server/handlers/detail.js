
// logger
var logger = require('../logger.js').getLogger('handle-detail')

var fs = require('fs')
var swig = require('swig')

var formatRef = function (ref) {
	return ref.replace('#/', '').split('/')
}

var attachValue = function (attachedObj, attachedKey, attachedValue) {
	attachedObj[attachedKey] = attachedValue
}

var getRefObject = function (definitions, swaggerRef) {
	var ref = formatRef(swaggerRef)
	var dep = definitions
	ref.forEach(function (p, index) {
		logger.debug('Current dep path: %s', p)
		dep = dep[p]
	})
	if (dep.properties) {
		return dep
	}
	else {
		logger.error('ref %s not found', swaggerRef)
		return {}
	}
}

var copyProperties = function (definitions, fromObj, toObj) {
	for (var p in fromObj) {
		if (!fromObj.hasOwnProperty(p)) { continue; }
		if (p == 'type') { continue; }
		if (p == '$ref') {
			var dep = getRefObject(definitions, fromObj[p])
			if (!dep || !dep.properties) {
				continue;
			}
			copyProperties(definitions, dep.properties, toObj)
		} else {
			switch (fromObj[p].type) {
				case 'object':
					copyProperties(definitions, fromObj[p], toObj)
					break;
				case 'integer':
					attachValue(toObj, p, Math.floor(Math.random(1) * 100))
					break;
				case 'number':
					attachValue(toObj, p, Math.floor(Math.random(1) * 100))
					break;
				case 'string':
					attachValue(toObj, p, fromObj[p].type)
					break;
				case 'boolean':
					attachValue(toObj, p, true)
					break;
				case 'array':
					toObj[p] = []
					if (fromObj[p].items.type && fromObj[p].items != 'object') {
						toObj[p].push(fromObj[p].items.type)
					} else {
						var arrObj = {}
						copyProperties(definitions, fromObj[p].items, arrObj)
						toObj[p].push(arrObj)
					}
					break;
				default:
					attachValue(toObj, p, fromObj[p].type)
					break;
			}
		}
	}
}

/* This function is better than the one nowdays, can update it later */
var getValueByType = function (obj) {
	if (!obj || !obj.type) { return null }
	switch (obj.type) {
		case 'object':
			return obj.properties
		case 'integer':
			Math.floor(Math.random(1) * 100)
		case 'string':
			return 'string-value'
		case 'boolean':
			return true
		case 'array':
			return obj.items
		default:
			return null
	}
}

var getConsummers = function (consummer) {
	var res = []
	if (consummer && consummer.length > 0) {
		res = consummer
	}
	return res
}

var getParam = function (definitions, param) {
	var res = []
	if (param && param.length > 0) {
		param.forEach(function (value, index) {
			value.isSubmit = false
			if (value.schema) {
				var path = formatRef(value.schema.$ref)
				value.ref = path[path.length - 1]

				var schema = getSchemaByRef(definitions, value.schema.$ref)
				value.isSubmit = true
				value.schemaJson = JSON.stringify(schema, null, 2)
					.replace(/ /g, "&nbsp;&nbsp;")
					.replace(/\r\n/g, "<br>")
					.replace(/\n/g, "<br>")

				res.push(value)
			} else {
				res.push(value)
			}
		})
	}
	return res
}

var getSchemaByRef = function (definitions, swaggerRef) {
	var res = {}
	var dep = getRefObject(definitions, swaggerRef)
	if (!dep) {
		return res
	}
	if (dep.properties) {
		copyProperties(definitions, dep.properties, res)
	}
	return res
}

var getResponse = function (data, resp) {
	var res = {}
	if (resp['200']) {
		res = {
			desc: resp['200'].description
		}

		var path = formatRef(resp['200'].schema.$ref)
		res.ref = path[path.length - 1]

		res.schema = getSchemaByRef(data, resp['200'].schema.$ref)
	}
	return res
}


var getOptByPath = function (data, path) {
	logger.info('Finding path: %s', path)
	var result = []
	for (var p in data.paths) {
		if (!data.paths.hasOwnProperty(p))
		{ continue; }
		if (path != p) {
			continue;
		}
		logger.info('Found path: %s ', p)
		for (var m in data.paths[p]) {
			if (!data.paths[p].hasOwnProperty(m)) {
				continue;
			}
			var res = {}

			var method = m.toUpperCase()
			logger.debug('Found path %s | method: %s ', path, method)
			res.method = method

			var pData = data.paths[p][m]

			var pDataComsumer = getConsummers(pData.consumes)
			// logger.debug('%s | method: %s | consummer: %s', path, method, JSON.stringify(pDataComsumer))
			res.consummers = pDataComsumer

			var pDataParameters = getParam(data, pData.parameters)
			logger.debug('Return %s | method: %s | request parameters: %s', path, method, JSON.stringify(pDataParameters))
			res.reqParam = pDataParameters

			var pDataResponse = getResponse(data, pData.responses)
			logger.debug('Return %s | method: %s | response schema: %s', path, method, JSON.stringify(pDataResponse))
			res.respParam = pDataResponse
			res.respInitData = JSON.stringify(pDataResponse.schema, null, 2)

			result.push(res)
		}
	}
	return result
}

var getCurrentData = function (method, path) {
	var file = 'data' + path + '/' + method.toLowerCase() + '.json'
	var res = ''
	logger.debug('Finding mock data: %s', file)
	if (fs.existsSync(file)) {
		logger.debug('Found mock data: %s', file)
		res = fs.readFileSync(file).toString()
	}
	return res
}

exports.handle = function (opt) {
	var data = JSON.parse(fs.readFileSync("swagger/swagger.json"))
	var tpl = swig.compileFile('tpl/detail.html')
	var pathData = getOptByPath(data, opt.path)
	pathData.forEach(function (value, index) {
		var mockData = getCurrentData(value.method, opt.path)
		value.mockData = mockData
	})
	return tpl({
		path: opt.path,
		basePath: '/api',
		pathData: pathData
	})
}