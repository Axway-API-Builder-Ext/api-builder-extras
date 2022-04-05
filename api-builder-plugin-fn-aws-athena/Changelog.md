# AWS-Athena Flow-Node Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Changed
- Now uses `apibuilder.engines` for documenting compatibility with API Builder.

## [2.0.0] 2022-02-03
### Security
- Updated depencencies to fix security issues

### Changed
- Refactored to new API-Builder SDK-Version
- Changed version of the aws-sdk from 2.610.0 to 2.648.0
- Using Simple-Mock for Unit-Tests
- Using a single AWS-Client initialized on API-Builder start

### Fixed
- Documentation links
- Now using standard api-builder-copy instead of copyconf script

## [1.0.1] 2020-03-30
### Changed
- Changed version of the aws-sdk from 2.610.0 to 2.648.0
### Security
- #10 Updated Dev-Dependency mocha and chai to latest version to use latest version of minimist

## [1.0.0] 2020-02-10
### Added
- First version of the AWS-Athena connector.
