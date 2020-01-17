function filter(req, include, cb) {
	const source = req.params.source;
	const fields = req.params.fields;

	if (!source || typeof source !== 'object') {
		return cb.error(null, 'Invalid source, object required.');
	} else if (!fields || !Array.isArray(fields)) {
		return cb.error(null, 'Invalid fields, array required.');
	}

	// JSON cloning to work with models better.
	const obj = JSON.parse(JSON.stringify(source));
	Object.keys(obj).forEach(field => {
		if ((!include && fields.includes(field))
			|| (include && !fields.includes(field))) {
			delete obj[field];
		}
	});
	cb.next(null, obj);
}

function include(req, cb) {
	filter(req, true, cb);
}

function exclude(req, cb) {
	filter(req, false, cb);
}

exports = module.exports = {
	include,
	exclude
};
