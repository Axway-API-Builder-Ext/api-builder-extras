//const APIBuilder = require('@axway/api-builder-runtime');
const convert = require('xml-js');

function removeJsonTextAttribute(value, parentElement) {

	try {
		if(typeof parentElement._parent === 'undefined') return;
		const parentOfParent = parentElement._parent;
		const pOpKeys = Object.keys(parentElement._parent);
		const keyNo = pOpKeys.length;
		const keyName = pOpKeys[keyNo - 1];
		const arrOfKey = parentElement._parent[keyName];
		const arrOfKeyLen = arrOfKey.length;
		if (arrOfKeyLen > 0) {
			const arr = arrOfKey;
			const arrIndex = arrOfKey.length - 1;
			arr[arrIndex] = value;
		} else {
			parentElement._parent[keyName] = value;
		}
	} catch (e) {
		console.log(e);
	}
};

function xmlToJson(req, cb) {
	//const server = APIBuilder.getGlobal();
	const { xmlData, asString } = req.params;
	const options = {
		compact: true,
		trim: true,
		nativeType: false,
		ignoreDeclaration: true,
		ignoreInstruction: true,
		ignoreAttributes: true,
		ignoreComment: true,
		ignoreCdata: true,
		ignoreDoctype: true,
		textFn: removeJsonTextAttribute
	};

	if (!xmlData) {
		// invoking the callback with an error will terminate the flow.
		return cb('invalid argument');
	}
	let result;
	try {
		if (asString) {
			console.log('Converting given XML data into a JSON-String.');
			result = convert.xml2json(xmlData, options);
		} else {
			console.log('Converting given XML data into a JS-Object.');
			result = convert.xml2js(xmlData, options);
		}
	} catch (e) {
		console.log(e.message);
		cb.error(null, 'Failed to convert XML to JSON.');
	}
	if(typeof result === 'undefined') {
		cb.error(null, 'Failed to convert XML to JSON.');
	}
	cb.next(null, result);
};

module.exports = xmlToJson;
