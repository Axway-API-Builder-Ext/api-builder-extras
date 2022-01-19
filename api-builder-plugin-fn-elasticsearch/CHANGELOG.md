# Elasticsearch Connector Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Fixed
- Documentation links
- Updated dependencies to solve security issues: 
  - https://github.com/advisories/GHSA-93q8-gq69-wqmw (ansi-regex)
  - https://github.com/advisories/GHSA-896r-f27r-55mw (json-schema)
  - https://github.com/advisories/GHSA-qgmg-gppg-76g5 (validator)
  - https://github.com/advisories/GHSA-v5vg-g7rq-363w (json-pointer)

## [2.1.0] 2021-09-16
### Added
- Create Index method now checks if a given Index-Template exists

## [2.0.0] 2021-09-14
### Changed
- Search method now provides missingIndex & noResult exists making it easier to control your flow
- New method Index document

## [1.0.23] 2021-09-10
### Fixed
- No longer trying to read ca.pem
- Now using api-builder-copy top copy default Elasticsearch-Configuration file

## [1.0.22] 2021-08-27
### Fixed
- Create transform method fixed

## [1.0.21] 2021-08-27
### Added
- Added Create Transform method

## [1.0.20] 2021-08-20
### Fixed
- When updating Rollup-Job existing job was not deleted, even if configured 

### Changed
- Elasticsearch client updated to version 7.14.0
- Drop Node.js v8.x support

## [1.0.19] 2021-02-03
### Fixed
- Index-Rollup method was rolling over indices too often depending on the number of existing indices

## [1.0.18] 2021-01-11
### Fixed
- The API-Builder process will no longer die, if Elasticsearch is not available for search request

## [1.0.17] 2020-12-18
### Fixed
- Fixed a problem, that API-Builder failed to start with split on undefined if the environment variable ELASTICSEARCH_HOSTS is not set

## [1.0.16] 2020-12-15
### Added
- Added the option to rollover multiple indicies based on a wildcard alias

## [1.0.15] 2020-12-10
### Added
- Added the option to disable the Elasticsearch connection validation during startup (e.g. environment variable: VALIDATE_ELASTIC_CONNECTION=false)

## [1.0.14] 2020-12-09
### Added
- New method: mockElasticsearchMethod to mock requests to Elasticsearch

## [1.0.13] 2020-12-09
### Changed
- Test & Logging of Elasticsearch connection improved

## [1.0.12] 2020-12-08
### Changed
- Connection to Elasticsearch is now establihed & validated on API-Builder startup

## [1.0.11] 2020-11-30
### Changed
- When putting an ILM-Policy, the policy it attached to the given Index-Template even if the policy is unchanged

## [1.0.9] 2020-11-30
### Fixed
- Put ILM-Policy may updated the ILM-Policy if not needed

### Changed
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
