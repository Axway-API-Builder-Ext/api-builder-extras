# Postgres Connector Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.1] 2022-02-03
### Fixed
- Documentation links

### Security
- Updated dependencies to fix security issues

## [2.0.0] 2021-10-07
### Fixed
- API-Builder crashes when using Postgres connector with Node.js 14 (See issue [#71](https://github.com/Axway-API-Management-Plus/apim-cli/issues/71))

### Changed
- Updated underlying PG-Library from version 7.18.2 to 8.7.1 (See issue [#71](https://github.com/Axway-API-Management-Plus/apim-cli/issues/71))

## [1.0.3] 2021-09-10
### Fixed
- Error loading connector/postgres@1.0.2. pg is not defined when not using connection pooling (See issue [#69](https://github.com/Axway-API-Management-Plus/apim-cli/issues/69))

### Changed
- The PostgresDB port now defaults to 5432 if not given

## [1.0.2] 2021-03-04
### Changed
- Replaced bundled copy-conf script with existing copy util.

## [1.0.1] 2021-03-04
### Changed
- Updated the package scope


## [1.0.0] 2020-03-04
### Added
- Initial version
