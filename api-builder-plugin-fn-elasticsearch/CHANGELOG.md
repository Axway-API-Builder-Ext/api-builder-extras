# Elasticsearch Connector Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.9] 2020-11-30
- Now using deep-equal to compare if ILM policy is updated or not

## [1.0.8] 2020-11-24
### Added
- new method to get legacy Elasticsearch index templates
- new method to put/update legacy Elasticsearch index templates
- new method to get index mappings
- new method to put/update index an mapping
- new method to create a new index
- new method check if an index exists
- new method to rollover an index
- new method get existing ILM Policies
- new method to create or update an ILM-Policy
- new method get existing rollup jobs
- new method to create or replace an rollup job

### Changed
- @axway/api-builder-sdk updated from version 1.0.0 to 1.0.7
- @elastic/elasticsearch updated from version 7.9.0 to 7.10.0

## [1.0.7] 2020-09-28
### Changed
- Default configuration now using nodes instead of node 
  parsed to an Array to configure multiple Elasticsearch nodes

## [1.0.6] 2020-09-10
### Changed
- Now forwarding all given Elasticsearch config parameters to the Elasticsearch client

## [1.0.5] 2020-09-05
### Fixed
- Query search results no properly returned

## [1.0.4] 2020-09-04
### Changed
- Upgraded Elastic client library to version 7.9.0
- Upgraded to new API-Builder SDK 1.0.0

## [1.0.0] 2020-03-13
### Added
- Initial version
