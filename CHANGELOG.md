# Changelog

All notable changes to the IBM® Db2® Plug-in for Zowe CLI will be documented in this file.

## `6.1.1`

- BugFix: Updated axios transitive dependency to resolve technical debt. [#172](https://github.com/zowe/zowe-cli-db2-plugin/pull/172)

## `6.1.0`

- Enhancement: Updated ibm_db dependency to support Node.js 22 and native installation on M1 Macs.

## `6.0.0`

- MAJOR: v6.0.0 release

## `6.0.0-next.202409201929`

- Update: Final prerelease

## `6.0.0-next.202408142011`

- BugFix: Updated axios transitive dependency to resolve technical debt. [#156](https://github.com/zowe/zowe-cli-db2-plugin/pull/156)

## `6.0.0-next.202407101551`

- BugFix: Updated axios transitive dependency to resolve technical debt. [#151](https://github.com/zowe/zowe-cli-db2-plugin/pull/151)

## `6.0.0-next.202403192050`

- BugFix: Updated follow-redirects transitive dependency to resolve technical debt. [#148](https://github.com/zowe/zowe-cli-db2-plugin/pull/148)

## `6.0.0-next.202403062029`

- BugFix: Updated plug-in to exit code 1 if it encounters an error when issuing commands to Db2 [#144](https://github.com/zowe/zowe-cli-db2-plugin/pull/144)
- V3 Breaking: Updated engines, removed health check and v1 profile support, added port and database to config template [#144](https://github.com/zowe/zowe-cli-db2-plugin/pull/144)

## `5.0.9`

- BugFix: Updated axios transitive dependency to resolve technical debt. [#154](https://github.com/zowe/zowe-cli-db2-plugin/pull/154)

## `5.0.8`

- BugFix: Updated axios transitive dependency to resolve technical debt. [#149](https://github.com/zowe/zowe-cli-db2-plugin/pull/149)

## `5.0.7`

- BugFix: Updated follow-redirects transitive dependency to resolve technical debt. [#147](https://github.com/zowe/zowe-cli-db2-plugin/pull/147)

## `5.0.6`

- BugFix: Updated follow-redirects transitive dependency to resolve technical debt. [#139](https://github.com/zowe/zowe-cli-db2-plugin/pull/139)

## `5.0.5`

- BugFix: Added missing npm-shrinkwrap.

## `5.0.4`

- BugFix: Updated ibm_db dependency to resolve technical debt

## `5.0.3`

- BugFix: Updated ibm_db dependency for better support with Node.js 18

## `5.0.2`

- BugFix: Updated the version of minimatch

## `5.0.1`

- BugFix: Updated ibm_db dependency to be compatible with Node.js 18

## `5.0.0`

- Major: Updated for V2 compatibility. See the prerelease items below for more details.

## `5.0.0-next.202204121850`

- BugFix: Updated ibm_db to allow the plugin to install on M1 Macs.

## `5.0.0-next.202204111359`

- BugFix: Fixed error messages when host, port, user, password, or database are omitted
- BugFix: Fixed daemon mode prompting

## `5.0.0-next.202203241624`

- BugFix: Updated follow-redirects and minimist dependencies to resolve potential vulnerabilities.

## `5.0.0-next.202202071745`

- BugFix: Pruned dev dependencies from npm-shrinkwrap file.

## `5.0.0-next.202201261756`

- BugFix: Included an npm-shrinkwrap file to lock-down all transitive dependencies.

## `5.0.0-next.202109071706`

- Remove @zowe/cli peer dependency to better support NPM v7

## `5.0.0-next.202104141730`

- Publish `@next` tag that is compatible with team config profiles.

## `4.1.6`

- BugFix: Update ibm_db to allow the plugin to install on M1 Macs.

## `4.1.5`

- BugFix: Updated follow-redirects and minimist dependencies to resolve potential vulnerabilities.

## `4.1.4`

- BugFix: Pruned dev dependencies from npm-shrinkwrap file.

## `4.1.3`

- BugFix: Included an npm-shrinkwrap file to lock-down all transitive dependencies.

## `4.1.1`

- Enhancement: Update ibm_db dependency to support Node v16 [#82](https://github.com/zowe/zowe-cli-db2-plugin/issues/82)

## `4.1.0`

- Adds semicolon after each sql statement when exporting a table.
- Enhancement: Added a help example for how to pass output values when calling a Db2 stored procedure.

## `4.0.7`

- BugFix: Added support for Node v14. [#60](https://github.com/zowe/zowe-cli-db2-plugin/pull/60)

## `4.0.6`

- Decrease Imperative load time for plugin

## `4.0.5`

- Tagged 4.X.X as @zowe-v1-lts

## `4.0.4`

- Updated typescript dev dependency to fix building the plugin

## `4.0.3`

- Updated documentation to include Xcode, fix links and branding

## `4.0.2`

- Updated ibm_db dependency to add Node 12 support

## `4.0.1`

- Updated documentation to include:
  - How the plugin works
  - Software requirements
  - How to install and uninstall the plugin
  - How to build from source
  - How to run tests
  - Contribution information
  - Where to find tutorials
  - Link to Imperative CLI Framework documentation

## `4.0.0`

- Change name to @zowe/db2-for-zowe-cli
- Bump imperative and cli peer dependency versions
- Rebrand documentation
