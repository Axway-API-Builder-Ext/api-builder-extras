const { mdToPdf } = require('md-to-pdf');
const pdf = require('pdf-parse');

async function generatePDFFromMarkdown(params) {
	const {
		markdown
	} = params;
	if (!markdown) {
		throw new Error('Missing required parameter: markdown');
	}
	if (typeof markdown !== 'string') {
		throw new Error('Invalid parameter: markdown');
	}

	const doc = {
		content: markdown
	}

	const pdf = await mdToPdf(doc);
	return pdf.content;
}

async function parsePDF(params) {
	const {
		data
	} = params;
	if (!data) {
		throw new Error('Missing required parameter: data');
	}
	if (!Buffer.isBuffer(data)) {
		throw new Error('Invalid parameter: data');
	}
	const parsed = await pdf(data);
	return {
		version: parsed.version,
		pages: parsed.numpages,
		pagesRendered: parsed.numrender,
		info: {
			version: parsed.info.PDFFormatVersion,
			isAcroFormPresent: parsed.info.IsAcroFormPresent,
			isXFAPresent: parsed.info.IsXFAPresent,
			creator: parsed.info.Creator,
			producer: parsed.info.Producer,
			created: parsed.info.CreationDate,
			modified: parsed.info.ModDate
		},
		metadata: parsed.metadata,
		text: parsed.text
	};
}

module.exports = {
	generatePDFFromMarkdown,
	parsePDF
};
