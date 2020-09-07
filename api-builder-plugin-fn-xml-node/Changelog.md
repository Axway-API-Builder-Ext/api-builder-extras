# XML Flow-Node Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

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
