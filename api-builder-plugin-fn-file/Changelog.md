# File Flow-Node Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Fixed
- Documentation links

## [0.0.8] 2021-04-06
### Added
- Added debug messages to log filenames used to read and write files

### Changed
- Dependencies updated

## [0.0.7] 2021-01-10
### Added
- Added the possibility to defined a max read limit

## [0.0.6] 2021-01-09
### Added
- Added option for a dynamic path for readFile

## [0.0.5] 2020-11-16
### Added
- New Exit: NotFound if the file cannot be found
- New toggle, to let the flow-node still fail, if the file cannot be found

## [0.0.4] 2020-11-05
### Added
- Support to read standard or JSON files

### Changed
- csv-parse version: 4.8.5 -> 4.14.0
- lodash    version: 4.17.15 -> 4.17.20

## [0.0.3] 2020-06-19
### Added
- Support to write native files to the disk
- Upgrade to @axway/api-builder-sdk v1.0.0
- Test suite now using @axway/api-builder-test-utils v1.0.0

## [0.0.2] 2020-03-30
### Security
- #10 Updated Dev-Dependencies mocha & chai to the latest version

## [0.0.1] 2020-01-17
### Added
- Added support to read from CSV-Files
