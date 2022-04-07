# @axway/api-builder-plugin-fn-pdf

PDF flow-node for [API Builder](https://docs.axway.com/bundle/api-builder/page/docs/index.html) provides functions to generate and parse PDF files.

## Install

Install within an API Builder project using:

```bash
npm install @axway/api-builder-plugin-fn-pdf
```

## Methods

The following sections provide details of the PDF flow-node methods.

### Generate PDF from markdown

Generates PDF from markdown text using https://www.npmjs.com/package/md-to-pdf.

#### Parameters

| Parameter | Type | Description | Configuration selection | Required |
| --- | --- | --- | --- | --- |
| Markdown | string | A github flavored markdown string. | Selector, String | Yes |

#### Outputs

| Output | Type | Description | Save output value as: |
| --- | --- | --- | --- |
| Next | any | The PDF data. | `$.pdf` |
| Error | any | The PDF generation failed. | `$.error` |

### Parse PDF data

Parses a PDF using https://www.npmjs.com/package/pdf-parse.

#### Parameters

| Parameter | Type | Description | Configuration selection | Required |
| --- | --- | --- | --- | --- |
| Data | Buffer | A PDF Buffer. | Selector, Object | Yes |

#### Outputs

| Output | Type | Description | Save output value as: |
| --- | --- | --- | --- |
| Next | any | The parsed PDF. | `$.parsedPdf` |
| Error | any | PDF parsing failed. | `$.error` |
