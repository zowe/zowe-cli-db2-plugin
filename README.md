# IBM® Db2® Database Plug-in for Zowe™ CLI <!-- omit in toc -->

[![codecov](https://codecov.io/gh/zowe/zowe-cli-db2-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/zowe/zowe-cli-db2-plugin)

The IBM® Db2® Database Plug-in for Zowe™ CLI lets you interact with IBM® Db2® Database for z/OS and perform tasks with modern development tools to automate typical workloads more efficiently. The plug-in also lets you to interact with Db2 to advance continuous integration to validate product quality and stability.

- [How the plug-in works](#how-the-plug-in-works)
- [Software requirements](#software-requirements)
- [Installing](#installing)
- [Building from source](#building-from-source)
- [Creating a user profile](#creating-a-user-profile)
- [Running tests](#running-tests)
- [Uninstalling](#uninstalling)
- [Contributing](#contributing)

## How the plug-in works

The plug-in executes SQL statements against a Db2 region, export a Db2 table, and call a stored procedure.

The plug-in exposes its API so that the plug-in can be used directly in other products.

## Software requirements

Before you install and use the plug-in:

-   [Install Zowe CLI](https://docs.zowe.org/stable/user-guide/cli-installcli.html) on your computer.

-   Have a license file for IBM Db2 Database for z/OS.

    For connectivity to Db2 for z/OS, the Db2 region should be `db2connectactivated` or a `db2connect` license file should be provided. Copy the `db2connect` license file to the `[db2 plugin folder]/node_modules/ibm_db/installer/clidriver/license/` folder. For more information, see [Addressing the license requirement](https://docs.zowe.org/stable/user-guide/cli-db2plugin.html#addressing-the-license-requirement) on the Zowe Docs site. 

- **(Linux and MacOS only)** Download and install [node-gyp](https://www.npmjs.com/package/node-gyp) globally by running `npm install -g node-gyp`

- **(MacOS only)** Download and Install [Xcode](https://developer.apple.com/xcode/resources/) and [Python 3](https://www.python.org/downloads/mac-osx/).

- **(Linux only - Debian, Ubuntu)** Download and Install the following via apt: `python3 make g++`

- **(Linux only - CentOS, RHEL)** Download and Install the following via yum: `python3 make gcc-c++`

- Note: Reinstallation is required when Node is upgraded to a new major version. When installed, the plug-in builds a native binary that is needed to interact with Db2. If a new major version of Node is installed, you must uninstall and reinstall the IBM Db2 Database Plug-in to update the binary. 

## Installing

Use one of the following methods to install the plug-in:

-   Install the plug-in from an online registry or a local package.

    Use the online registry/local package method when you simply want to install the plug-in to Zowe CLI and start using it.

    For more information, see [Installing plug-ins](https://docs.zowe.org/stable/user-guide/cli-installplugins.html) on the Zowe Docs website.

-   Build the plug-in from source and install it into your Zowe CLI implementation.

    Use the build from source method when you want to install the plug-in to Zowe CLI using the most current binaries and modify the behavior of the plug-in. For example, you want to create a new command and use the plug-in with the command that you created.
    
    For more information, see [Building from source](#building-from-source).

## Building from source

**Follow these steps:**

1.  The first time that you clone this plug-in from the GitHub repository, issue the following command against the local directory:

    ```
    npm install
    ```
    
    The command installs the required dependencies and several development tools. You can run the task at any time to update the tools as needed.

2.  To build your code changes, issue the following command:
    
    ```
    npm run build
    ```

    The first time you build your code changes, you will be prompted for the location of the Imperative CLI Framework package, which is located in the `node_modules/@zowe` folder in the Zowe CLI home directory.

    **Note:** When you update `package.json` to include new dependencies, or when you pull changes
    that affect `package.json`, issue the `npm update` command to download the dependencies.

3.  Issue one of the following commands to install the plug-in:
    ```
    zowe plugins install <local path your cloned repo>
    ```
    Or:
    ```
    zowe plugins install .
    ```
**Tip:** After the installation process completes, it validates that the plug-in was installed correct and the names of its commands, options, and arguments do not conflict with that of the other plug-ins that you installed into your Zowe CLi implimentation.

When the validation process is successful, the following message displays:

```
Validation results for plugin 'db2':
Successfully validated.
```

When an unsuccessful message displays, you can troubleshoot the installation by addressing the issues that the message describes. You can also review the information that is contained in the log file that is located in the Zowe CLI home directory.

## Creating a user profile

After you install the plug-in, you create a Db2 profile. A Db2 profile is required to issue commands to the Db2 region. Db2 profiles contain your host, port, user name, password, and a database name for the IBM Db2 server of your choice. You can create multiple profiles and switch between them as needed.

**Follow these steps:**
1.  Create a Db2 profile: 
    
    ```
    zowe profiles create db2 <profile name> -H <host> -P <port> -u <user> -p <password> -d <database>
    ```
    
    The result of the command displays as a success or failure message. You can use your profile when you issue commands in the Db2 command group.

**Tip:** For more information about the syntax, actions, and options, for a profiles create command, open Zowe CLI and issue the following command:
```
zowe profiles create db2 -h
```

## Running tests

You can perform the following types of tests on the IBM DB2 plug-in:

- Unit
- Integration
- System

For information about running automated, unit, and system and integration tests using the plug-in, see [Zowe CLI Plug-in Testing Guidelines](https://github.com/zowe/zowe-cli/blob/master/docs/PluginTESTINGGuidelines.md).

Before you can perform the tests, copy the file named `.../__tests__/__resources__/properties/example_properties.yaml` and create a file named `.../__tests__/__resources__/properties/custom_properties.yaml`.

**Note:** Information about the required values and how to customize the `custom_properties.yaml` file is provided in the yaml file itself.
 
Issue the following commands to run the tests:

1. `npm run test:unit`
2. `npm run test:integration`
3. `npm run test:system`

Any failures potentially indicate an issue with the set-up of the Rest API or configuration parameters that were passed in the `custom_properties.yaml` file.

## Uninstalling

**Follow these steps:**

1.  To uninstall the plug-in from a base application, issue the following command:
    ```
    zowe plugins uninstall @zowe/db2-for-zowe-cli
    ```
After the uninstallation process completes successfully, the product no longer contains the plug-in configuration.

## Troubleshooting

### Node.js version incompatible with plug-in

**Error message**:
```
The module 'C:\Users\User\.zowe\plugins\installed\node_modules\@zowe\db2-for-zowe-cli\node_modules\ibm_db\build\Release\odbc_bindings.node' was compiled against a different Node.js version using NODE_MODULE_VERSION ###. This version of Node.js requires NODE_MODULE_VERSION ###. Please try re-compiling or re-installing this module (for instance, using npm rebuild or npm install).
```

**Action**: Uninstall and reinstall the IBM Db2 Database Plug-in for Zowe CLI. The Node version installed on the system has changed since the IBM Db2 Database Plug-in for Zowe CLI was installed on the system, and the native binary is no longer compatible.

## Contributing

For information about contributing to the plug-in, see the Zowe CLI [Contribution Guidelines](CONTRIBUTING.md). The guidelines contain standards and conventions for developing plug-ins for Zowe CLI. This includes information about running, writing, maintaining automated tests, developing consistent syntax in your plug-in, and ensuring that your plug-in integrates properly with Zowe CLI.

### Tutorials

To learn about building new commands or a new plug-in for Zowe CLI, see  [Develop for Zowe CLI](https://docs.zowe.org/stable/extend/extend-cli/cli-devTutorials.html).

### Imperative CLI Framework documentation

[Imperative CLI Framework](https://github.com/zowe/imperative/wiki) documentation is a key source of information to learn about the features of Imperative CLI Framework (the code framework that you use to build plug-ins for Zowe CLI). Refer to the documentation as you develop your plug-in.