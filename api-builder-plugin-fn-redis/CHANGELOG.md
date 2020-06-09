# Redis Connector Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added
- Upgrade to @axway/api-builder-sdk v1.0.0
- Test suite now using @axway/api-builder-test-utils v1.0.0

## [0.0.5] 2020-05-28
### Added
- Upgrade to @axway/api-builder-sdk 0.6.0

## [0.0.4] 2020-05-18
### Added
- Added the ability to define the Time-to-Live on set.

## [0.0.4] 2020-05-06
### Added
- Allows loading the plugin in development mode with bad Redis connection

## [0.0.3] 2020-04-24
### Added
- The Get-Method now has an additional exit: No result
- Improved Test-Framework to run integration tests during release

## [0.0.2] 2020-04-23
### Added
- Prevents retry on connect
- Throw exception in case of Redis connection failure
- Facade for Redis client
- Actions use async version of Redis client api
- Register API Builder hooks for graceful disconnect
- Reusable utils to register context for actions
- Set up approach to run unit and integration test suites

## [0.0.1] 2020-04-08
### Added
- Initial version
