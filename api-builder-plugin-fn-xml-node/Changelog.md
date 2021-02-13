# XML Flow-Node Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [1.0.8] 2021-02-13
### Fixed
- CDATA is no longer ignored and can be controlled with a new parameter [#36](https://github.com/Axway-API-Builder-Ext/api-builder-extras/issues/36)

### Changed
- updated @axway/api-builder-test-utils from 1.1.0 to 1.1.4
- updated @axway/api-builder-sdk from 1.0.0 to 1.1.7
- updated mocha from 7.1.1 to 7.2.0
- updated chai from 4.1.2 to 4.3.0

## [1.0.7] 2020-09-07
### Changed
- now using the same selector ($.property) syntax as for any other context variable.

## [1.0.6] 2020-09-07
### Added
- New feature to retrieve an object specified by a path
- New feature to remove namespaces given in XML when converting into JSON
- Refactored plugin using the new Flow-Node SDK

### Security
- #10 Updated Dev-Dependencies mocha & chai to the latest version

## [1.0.5] 2020-01-16
### Added
- #5 Flow-Node XML Method XML2JSON now supports the Error-Path

## [1.0.4] 2020-01-10
### Added
- Initial version of the XML flow node
