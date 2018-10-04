# Zowe CLI Plug-in for IBM® Db2® for z/OS®
The Zowe CLI plug-in for IBM® Db2® Database lets you interact with Db2 for z/OS to perform tasks
with modern development tools to automate typical workloads more efficiently.
The plug-in also enables you to interact with Db2 to advance continuous integration to validate product
quality and stability.

Zowe CLI Plug-in for IBM Db2 Database lets you execute SQL statements against a Db2 region,
export a Db2 table, and call a stored procedure. The plug-in also exposes its API
so that the plug-in can be used directly in other products.

## Contribution Guidelines

For more information about general development guidelines and Db2 plug-in specific information,
see [the Contribution Guidelines](CONTRIBUTING.md).

**Tip:** Visit our [Sample Plug-in repository](https://github.com/gizafoundation/brightside-sample-plugin)
and follow the tutorials to start developing your first plug-in. 

## Prerequisites
Before you install the plug-in, meet the following prerequisites:
* Install Zowe CLI on your PC.
    
    **Note:** For more information, see the [Zowe CLI](https://zowe.github.io/docs-site/user-guide/cli-installcli.html)
    documentation.
* Have a license file of IBM Db2 for z/OS

  For connectivity against Db2 for z/OS, the Db2 region should be `db2connectactivated` or
  a `db2connect` license file should be provided. Copy the `db2connect` license file to
  the `[db2 plugin folder]/node_modules/ibm_db/installer/clidriver/license/` folder.

## Build the Plug-in from Source
**Follow these steps:**

1. The first time that you download the Zowe CLI plug-in for Db2 from the GitHub repository,
   issue the following command against the local directory:

    ```
    npm install
    ```
    The command installs the required Zowe CLI Plug-in for Db2 dependencies and several development tools.
    When necessary, you can run the task at any time to update the tools.

2. To build your code changes, issue the following command:
    ```
    npm run build
    ```
    The first time you build your code changes, you are prompted for the location
    of the Imperative CLI Framework package, which is located in the `node_modules/@brightside`
    folder in the directory where Zowe CLI is installed.

    **Note:** When you update `package.json` to include new dependencies, or when you pull changes
    that affect `package.json`, issue the `npm update` command to download the dependencies.

## Install the Zowe CLI Plug-in for Db2
**Follow these steps:**

1.  Meet the prerequisites.
2.  Install the plug-in:
    ```
    zowe plugins install @brightside/db2
    ``` 
3.  (Optional) Verify the installation:
    ```
    zowe plugins validate @brightside/db2
    ```
    When you install the plug-in successfully, the following message displays:
    ```
    Validation results for plugin 'db2':
    Successfully validated.
    ``` 
    **Tip:** When an unsuccessful message displays, you can troubleshoot the installation
    by addressing the issues that the message describes. You can also review the information
    that is contained in the log file that is located in the directory where you installed Zowe CLI.  
4.  [Create a profile](#create-a-profile).

## Create a Profile
After you install the plug-in, you create a Db2 profile. A Db2 profile is required to issue commands
to the Db2 region. Db2 profiles contain your host, port, user name, password, and a database name
for the IBM Db2 server of your choice. You can create multiple profiles and switch between them as needed.

**Follow these steps:**
1.  Create a Db2 profile: 
    ```
    zowe profiles create db2 <profile name> -H <host> -P <port> -u <user> -p <password> -d <database>
    ```
    The result of the command displays as a success or failure message.
    You can use your profile when you issue commands in the Db2 command group.

**Tip:** For more information about the syntax, actions, and options, for a profiles create command,
open Zowe CLI and issue the following command:
```
zowe profiles create db2 -h
```

## Run Tests

For information about running automated, unit, and system and integration tests using the plug-in,
see [Zowe CLI Plug-in Testing Guidelines](https://github.com/gizafoundation/brightside/blob/master/docs/PluginTESTINGGuidelines.md#ca-brightside-plug-in-testing-guidelines).

## Uninstall the Plug-in
**Follow these steps:**

1.  To uninstall the plug-in from a base application, issue the following command:
    ```
    zowe plugins uninstall @brightside/db2
    ```
After the uninstallation process completes successfully, the product no longer contains the plug-in configuration.
