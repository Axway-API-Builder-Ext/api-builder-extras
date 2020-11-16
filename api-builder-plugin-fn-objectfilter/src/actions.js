async function filter(params, include, options) {
	const source = params.source;
	const fields = params.fields;

	if (!source || typeof source !== 'object') {
		throw new Error('Invalid source, object required.');
	} else if (!fields || !Array.isArray(fields)) {
		throw new Error('Invalid fields, array required.');
	}

	// JSON cloning to work with models better.
	const obj = JSON.parse(JSON.stringify(source));
	Object.keys(obj).forEach(field => {
		if ((!include && fields.includes(field))
			|| (include && !fields.includes(field))) {
			delete obj[field];
		}
	});
	return obj;
}

async function include(params, options) {
	return filter(params, true, options);
}

async function exclude(params, options) {
	return filter(params, false, options);
}

exports = module.exports = {
	include,
	exclude
};
