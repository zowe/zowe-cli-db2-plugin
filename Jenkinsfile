/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
*                                                                                 *
*/

// The following property need to be set for the HTML report
// @TODO figure out how to get this nicely on jenkins
//System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")

/**
* Development branches considered for release purposes
*/ 
def DEV_BRANCH = [
    master: "master",
    beta: "beta",
    latest: "latest",
    incremental: "lts-incremental",
    stable: "lts-stable",
]

/**
* List of release branches
*/ 
def RELEASE_BRANCHES = [DEV_BRANCH.master, DEV_BRANCH.beta, DEV_BRANCH.latest, DEV_BRANCH.incremental, DEV_BRANCH.stable]

/**
 * The following flags are switches to control which stages of the pipeline to be run.  This is helpful when
 * testing a specific stage of the pipeline.
 */
def PIPELINE_CONTROL = [
    build: true,
    unit_test: true,
    integration_test: false,
    system_test: false,
    deploy: true,
    smoke_test: true,
    create_bundle: true,
    ci_skip: false ]

/**
 * The result strings for a build status
 */
def BUILD_RESULT = [
    success: 'SUCCESS',
    unstable: 'UNSTABLE',
    failure: 'FAILURE'
]

def DL_URL = [
    // Public Bintray
    bintray: 'https://api.bintray.com/npm/ca/brightside/',
    // Giza Artifactory
    artifactory: 'https://gizaartifactory.jfrog.io/gizaartifactory/api/npm/npm-local-release/'
]
def rmProt(String url) {
    return url.contains("https") ? url.replace("https://", "") : url.replace("http://", "");
}

/**
* Targeted scope
*/
def TARGET_SCOPE = "@brightside"

/**
* Zowe tag to be installed
*/
def CLI_TAG_VERSION = "@next"

/**
 * Test npm registry using for smoke test
 */
def TEST_NPM_REGISTRY = "http://imperative-npm-registry.ca.com"

/**
 * The root results folder for items configurable by environmental variables
 */
def TEST_RESULTS_FOLDER = "__tests__/__results__"

/**
 * The location of the unit test results
 */
def UNIT_RESULTS = "${TEST_RESULTS_FOLDER}/unit"

/**
 * The location of the integration test results
 */
def INTEGRATION_RESULTS = "${TEST_RESULTS_FOLDER}/integration"

/**
 * The location of the system test results
 */
 def SYSTEM_RESULTS = "${TEST_RESULTS_FOLDER}/system"

/**
 * The credentials ID of the DB2 license installer
 */
def DB2_INSTALLER_ID = 'db2-license-installer'

/**
 * The credentials ID of the authorized DB2 user
 */
def DB2_CREDENTIALS_ID = '***REMOVED***'

/**
 * List of people who will get all emails for master builds
 */
def MASTER_RECIPIENTS_LIST = "Evghenii.Vasilovici@broadcom.com, cc:Fernando.RijoCedeno@broadcom.com, cc:Michael.Bauer2@broadcom.com, cc:Mark.Ackert@broadcom.com, cc:Daniel.Kelosky@broadcom.com"

/**
 * The user's name for git commits
 */
def GIT_USER_NAME = 'zowe-robot'

/**
 * The user's email address for git commits
 */
def GIT_USER_EMAIL = 'zowe.robot@gmail.com'

/**
 * The base repository url for github
 */
def GIT_REPO_URL = 'https://github.com/zowe/zowe-cli-db2-plugin.git'

/**
 * The credentials id field for the authorization token for GitHub stored in Jenkins
 */
def GIT_CREDENTIALS_ID = 'zowe-robot-github'

/**
 * A command to be run that gets the current revision pulled down
 */
def GIT_REVISION_LOOKUP = 'git log -n 1 --pretty=format:%h'

/**
 * The credentials id field for the artifactory username and password
 */
def ARTIFACTORY_CREDENTIALS_ID = 'GizaArtifactory'

/**
 * The email address for the artifactory
 */
def ARTIFACTORY_EMAIL = GIT_USER_EMAIL

/**
 * This is the product name used by the build machine to store information about
 * the builds
 */
def PRODUCT_NAME = "cli-db2-plugin"

/**
 * This is where the CLI project needed to be install
 */
def CLI_DIR = "/.npm-global/lib/node_modules/${TARGET_SCOPE}/core"

// Setup conditional build options. Would have done this in the options of the declarative pipeline, but it is pretty
// much impossible to have conditional options based on the branch :/
def opts = []

if (RELEASE_BRANCHES.contains(BRANCH_NAME)) {
    // Only keep 20 builds
    opts.push(buildDiscarder(logRotator(numToKeepStr: '20')))

    // Concurrent builds need to be disabled on the master branch because
    // it needs to actively commit and do a build. There's no point in publishing
    // twice in quick succession
    opts.push(disableConcurrentBuilds())
} else {
    // Only keep 5 builds on other branches
    opts.push(buildDiscarder(logRotator(numToKeepStr: '5')))
}

properties(opts)

pipeline {
    agent {
        label 'ca-jenkins-agent'
    }

    environment {
        // Environment variable for flow control. Indicates if the git source was updated by the pipeline.
        GIT_SOURCE_UPDATED = "false"
    }

    stages {
        /************************************************************************
         * STAGE
         * -----
         * Check for CI Skip
         *
         * TIMEOUT
         * -------
         * 2 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - Always
         *
         * DECRIPTION
         * ----------
         * Checks for the [ci skip] text in the last commit. If it is present,
         * the build is stopped. Needed because the pipeline does do some simple
         * git commits on the master branch for the purposes of version bumping.
         *
         * OUTPUTS
         * -------
         * PIPELINE_CONTROL.ci_skip will be set to 'true' if [ci skip] is found in the
         * commit text.
         ************************************************************************/
        stage('Check for CI Skip') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    script {
                        // We need to keep track of the current commit revision. This is to prevent the condition where
                        // the build starts on master and another branch gets merged to master prior to version bump
                        // commit taking place. If left unhandled, the version bump could be done on latest master branch
                        // code which would already be ahead of this build.
                        BUILD_REVISION = sh returnStdout: true, script: GIT_REVISION_LOOKUP

                        // This checks for the [ci skip] text. If found, the status code is 0
                        def result = sh returnStatus: true, script: 'git log -1 | grep \'.*\\[ci skip\\].*\''
                        if (result == 0) {
                            echo '"ci skip" spotted in the git commit. Aborting.'
                            PIPELINE_CONTROL.ci_skip = true
                        }
                    }
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Install the CLI
         *
         * TIMEOUT
         * -------
         * 10 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.build is true or PIPELINE_CONTROL.smoke_test is true
         *
         * DESCRIPTION
         * -----------
         * Install the CLI globally to be used to build the plugin and install
         * plugin to for smoke test
         *
         * OUTPUTS
         * -------
         * able to issue the CLI command.
         ************************************************************************/
        stage('Install the CLI') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.build || PIPELINE_CONTROL.smoke_test
                    }
                }
            }
            steps('Install the CLI') {
                timeout(time: 10, unit: 'MINUTES') {
                    echo "Install the CLI globaly"
                    sh "npm install -g ${TARGET_SCOPE}/core${CLI_TAG_VERSION} --${TARGET_SCOPE}:registry=${DL_URL.bintray}"
                    sh "zowe --version"
                    sh "zowe"
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Install Dependencies
         *
         * TIMEOUT
         * -------
         * 10 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.build is true
         *
         * DESCRIPTION
         * -----------
         * Logs into the open source registry and installs all the dependencies
         *
         * OUTPUTS
         * -------
         * None
         ************************************************************************/
        stage('Install: npm install') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.build
                    }
                }
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo 'Install'
                    sh "npm install"
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Build
         *
         * TIMEOUT
         * -------
         * 10 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.build is true
         *
         * DESCRIPTION
         * -----------
         * Executes the `npm run build` command to generate the application code.
         *
         * OUTPUTS
         * -------
         * Jenkins: Compiled application executable code
         ************************************************************************/
        stage('Build: npm run build') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.build
                    }
                }
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo 'Build'
                    sh "echo '${CLI_DIR}' | npm run build"

                    sh 'tar -czvf BuildArchive.tar.gz ./lib/'
                    archiveArtifacts 'BuildArchive.tar.gz'
                }
            }
        }
        /************************************************************************
         * STAGE
         * -----
         * Install Plugin
         *
         * TIMEOUT
         * -------
         * 10 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.build is true
         *
         * DESCRIPTION
         * -----------
         * Executes the `zowe plugins install` command to generate the application code.
         *
         * OUTPUTS
         * -------
         * Jenkins: Install application executable code plugin
         ************************************************************************/
        stage('Install Plugin') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.build
                    }
                }
            }
            steps{
                timeout(time: 10, unit: 'MINUTES') {
                    echo 'Install plugin'
                    sh "zowe plugins install ./"
                }
            }
        }
        /************************************************************************
         * STAGE
         * -----
         * Test: Unit
         *
         * TIMEOUT
         * -------
         * 10 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.unit_test is true
         *
         * ENVIRONMENT VARIABLES
         * ---------------------
         * JEST_JUNIT_OUTPUT:
         * Configures the jest junit reporter's output location.
         *
         * JEST_SUITE_NAME:
         * Configures the test suite name.
         *
         * JEST_JUNIT_ANCESTOR_SEPARATOR
         * Configures the separator used for nested describe blocks.
         *
         * JEST_JUNIT_CLASSNAME:
         * Configures how test class names are output.
         *
         * JEST_JUNIT_TITLE:
         * Configures the title of the tests.
         *
         * JEST_STARE_RESULT_DIR:
         * Configures the jest stare result output directory.
         *
         * JEST_STARE_RESULT_HTML:
         * Configures the jest stare result html file name.
         *
         * DESCRIPTION
         * -----------
         * Executes the `npm run test:unit` command to perform unit tests and
         * captures the resulting html and junit outputs.
         *
         * OUTPUTS
         * -------
         * Jenkins: Unit Test Report (through junit plugin)
         * HTML: Unit Test Report
         * HTML: Unit Test Code Coverage Report
         ************************************************************************/
        stage('Test: Unit') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.unit_test
                    }
                }
            }
            environment {
                JEST_JUNIT_OUTPUT = "${UNIT_RESULTS}/junit.xml"
                JEST_SUITE_NAME = "Unit Tests"
                JEST_JUNIT_ANCESTOR_SEPARATOR = " > "
                JEST_JUNIT_CLASSNAME="Unit.{classname}"
                JEST_JUNIT_TITLE="{title}"
                JEST_STARE_RESULT_DIR = "${UNIT_RESULTS}/jest-stare"
                JEST_STARE_RESULT_HTML = "index.html"
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo 'Unit Test'

                    // Run tests but don't fail if the script reports an error
                    sh "npm run test:unit || exit 0"

                    // Capture test report
                    echo 'Capture test report'
                    junit JEST_JUNIT_OUTPUT

                    echo 'Calculating coverage'
                    cobertura autoUpdateHealth: false,
                            autoUpdateStability: false,
                            coberturaReportFile: "${UNIT_RESULTS}/coverage/cobertura-coverage.xml",
                            failUnhealthy: false,
                            failUnstable: false,
                            onlyStable: false,
                            zoomCoverageChart: false,
                            maxNumberOfBuilds: 20,
                            // classCoverageTargets: '85, 80, 75',
                            // conditionalCoverageTargets: '70, 65, 60',
                            // lineCoverageTargets: '80, 70, 50',
                            // methodCoverageTargets: '80, 70, 50',
                            sourceEncoding: 'ASCII'

                    // Publish HTML report
                    echo 'Publishing Unit Test Report'
                    publishHTML(target: [
                            allowMissing         : false,
                            alwaysLinkToLastBuild: true,
                            keepAll              : true,
                            reportDir            : JEST_STARE_RESULT_DIR,
                            reportFiles          : JEST_STARE_RESULT_HTML,
                            reportName           : "${PRODUCT_NAME} - Unit Test Report"
                    ])

                    echo 'Publishing Unit Test Coverage Report'
                    publishHTML(target: [
                            allowMissing         : false,
                            alwaysLinkToLastBuild: true,
                            keepAll              : true,
                            reportDir            : "${UNIT_RESULTS}/coverage/lcov-report",
                            reportFiles          : 'index.html',
                            reportName           :  "${PRODUCT_NAME} - Unit Test Coverage Report"
                    ])
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Test: Integration
         *
         * TIMEOUT
         * -------
         * 30 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.integration_test is true
         *
         * ENVIRONMENT VARIABLES
         * ---------------------
         * JEST_JUNIT_OUTPUT:
         * Configures the jest junit reporter's output location.
         *
         * JEST_SUITE_NAME:
         * Configures the test suite name.
         *
         * JEST_JUNIT_ANCESTOR_SEPARATOR
         * Configures the separator used for nested describe blocks.
         *
         * JEST_JUNIT_CLASSNAME:
         * Configures how test class names are output.
         *
         * JEST_JUNIT_TITLE:
         * Configures the title of the tests.
         *
         * JEST_HTML_REPORTER_OUTPUT_PATH:
         * Configures the jest html reporter's output location.
         *
         * JEST_HTML_REPORTER_PAGE_TITLE:
         * Configures the jset html reporter's page title.
         *
         * TEST_SCRIPT:
         * A variable that contains the shell script that runs the integration
         * tests. So we don't have to type out a lot of text.
         *
         * DESCRIPTION
         * -----------
         * Executes the `npm run test:integration` command to perform
         * integration tests and captures the resulting html and junit outputs.
         *
         * OUTPUTS
         * -------
         * Jenkins: Integration Test Report (through junit plugin)
         * HTML: Integration Test Report
         ************************************************************************/
        stage('Test: Integration') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.integration_test
                    }
                }
            }
            environment {
                JEST_JUNIT_OUTPUT = "${INTEGRATION_RESULTS}/junit.xml"
                JEST_SUITE_NAME = "Integration Tests"
                JEST_JUNIT_ANCESTOR_SEPARATOR = " > "
                JEST_JUNIT_CLASSNAME="Integration.{classname}"
                JEST_JUNIT_TITLE="{title}"
                JEST_HTML_REPORTER_OUTPUT_PATH = "${INTEGRATION_RESULTS}/index.html"
                JEST_HTML_REPORTER_PAGE_TITLE = "${BRANCH_NAME} - Integration Test"
                TEST_SCRIPT = "./jenkins/integration_tests.sh"
            }
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    echo 'Integration Test'

                    sh "chmod +x $TEST_SCRIPT && dbus-launch $TEST_SCRIPT"

                    junit JEST_JUNIT_OUTPUT

                    // Publish HTML report
                    publishHTML(target: [
                            allowMissing         : false,
                            alwaysLinkToLastBuild: true,
                            keepAll              : true,
                            reportDir            : INTEGRATION_RESULTS,
                            reportFiles          : 'index.html',
                            reportName           : "${PRODUCT_NAME} - Integration Test Report"
                    ])
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Test: Sysem
         *
         * TIMEOUT
         * -------
         * 30 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.system_test is true
         *
         * ENVIRONMENT VARIABLES
         * ---------------------
         * JEST_JUNIT_OUTPUT:
         * Configures the jest junit reporter's output location.
         *
         * JEST_SUITE_NAME:
         * Configures the test suite name.
         *
         * JEST_JUNIT_ANCESTOR_SEPARATOR
         * Configures the separator used for nested describe blocks.
         *
         * JEST_JUNIT_CLASSNAME:
         * Configures how test class names are output.
         *
         * JEST_JUNIT_TITLE:
         * Configures the title of the tests.
         *
         * JEST_HTML_REPORTER_OUTPUT_PATH:
         * Configures the jest html reporter's output location.
         *
         * JEST_HTML_REPORTER_PAGE_TITLE:
         * Configures the jset html reporter's page title.
         *
         * TEST_SCRIPT:
         * A variable that contains the shell script that runs the integration
         * tests. So we don't have to type out a lot of text.
         *
         * DESCRIPTION
         * -----------
         * Executes the `npm run test:system` command to perform
         * system tests and captures the resulting html and junit outputs.
         *
         * OUTPUTS
         * -------
         * Jenkins: System Test Report (through junit plugin)
         * HTML: System Test Report
         ************************************************************************/
        stage('Test: System') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.system_test
                    }
                }
            }
            environment {
                JEST_JUNIT_OUTPUT = "${SYSTEM_RESULTS}/junit.xml"
                JEST_SUITE_NAME = "System Tests"
                JEST_JUNIT_ANCESTOR_SEPARATOR = " > "
                JEST_JUNIT_CLASSNAME="System.{classname}"
                JEST_JUNIT_TITLE="{title}"
                JEST_HTML_REPORTER_OUTPUT_PATH = "${SYSTEM_RESULTS}/index.html"
                JEST_HTML_REPORTER_PAGE_TITLE = "${BRANCH_NAME} - System Test"
                JEST_STARE_RESULT_DIR = "${SYSTEM_RESULTS}/jest-stare"
                JEST_STARE_RESULT_HTML = "index.html"
                TEST_SCRIPT = "./jenkins/system_tests.sh"
                TEST_PROPERTIES_FILE = "./__tests__/__resources__/properties/custom_properties.yaml"
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo 'System Test'

                    withCredentials([
                        file(credentialsId: DB2_INSTALLER_ID, variable: 'FILE'),
                        usernamePassword(credentialsId: DB2_CREDENTIALS_ID, usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')
                    ]) {
                        sh 'cp $FILE ./scripts/installlicense.sh'
                        sh 'chmod a+x ./scripts/installlicense.sh && ./scripts/installlicense.sh'
                        sh "echo \"db2:\n    hostname: 141.202.65.31\n    port: 5304\n    username: $USERNAME\n    password: $PASSWORD\n    database: D12APTIB\n\" > ${TEST_PROPERTIES_FILE}"
                        sh "ls -al ./__tests__/__resources__/properties"
                        sh "chmod +x $TEST_SCRIPT && dbus-launch $TEST_SCRIPT"
                    }

                    junit JEST_JUNIT_OUTPUT

                    // Publish HTML report
                    publishHTML(target: [
                            allowMissing         : false,
                            alwaysLinkToLastBuild: true,
                            keepAll              : true,
                            reportDir            : JEST_STARE_RESULT_DIR,
                            reportFiles          : JEST_STARE_RESULT_HTML,
                            reportName           : "${PRODUCT_NAME} - System Test Report"
                    ])
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Bump Version
         *
         * TIMEOUT
         * -------
         * 5 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.deploy is true
         * - The build is still successful and not unstable
         *
         * DESCRIPTION
         * -----------
         * Bumps the pre-release version in preparation for publishing to an npm
         * registry. It will clean out any pending changes and switch to the real
         * branch that was published (currently the pipeline would be in a
         * detached HEAD at the commit) before executing the npm command to bump
         * the version.
         *
         * The step does checking against the commit that was checked out and
         * the BUILD_REVISION that was retrieved earlier. If they do not match,
         * the commit will not be pushed and the build will fail. This handles
         * the condition where the current build made it to this step but another
         * change had been pushed to the master branch. This means that we would
         * have to bump the version of a future commit to the one we just built
         * and tested, which is a big no no. A corresponding email will be sent
         * out in this situation to explain how this condition could have occurred.
         *
         * OUTPUTS
         * -------
         * GitHub: A commit containing the bumped version in the package.json.
         *
         *         Commit Message:
         *         Bumped pre-release version <VERSION_HERE> [ci skip]
         ************************************************************************/
        stage('Bump Version') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.deploy
                    }
                    expression {
                        return currentBuild.resultIsBetterOrEqualTo(BUILD_RESULT.success)
                    }
                    expression {
                        return BRANCH_NAME.equals(DEV_BRANCH.master) || BRANCH_NAME.equals(DEV_BRANCH.beta)
                    }
                }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    echo "Bumping Version"

                    // Blow away any pending changes and pull down the master branch...
                    // this should be the same as our current commit since concurrency builds are turned
                    // off for that branch
                    sh "git reset --hard HEAD"
                    sh "git checkout ${BRANCH_NAME}"

                    // Configure the git environment
                    sh "git config user.name \"${GIT_USER_NAME}\""
                    sh "git config user.email \"${GIT_USER_EMAIL}\""
                    sh "git config push.default simple"

                    // Make sure that the revision of the build and the current revision of the DEV_BRANCH.master match
                    script {
                        revision = sh returnStdout: true, script: GIT_REVISION_LOOKUP

                        if (BUILD_REVISION != revision) {
                            error "Build revision does not match the GitHub branch source."
                        }
                    }

                    script {
                        if (BRANCH_NAME == DEV_BRANCH.master) {
                            def baseVersion = sh returnStdout: true, script: 'node -e "console.log(require(\'./package.json\').version.split(\'-\')[0])"'
                            def preReleaseVersion = baseVersion.trim() + "-alpha." + new Date().format("yyyyMMddHHmm", TimeZone.getTimeZone("UTC"))
                            sh "npm version ${preReleaseVersion} -m \"Bumped pre-release version to ${preReleaseVersion} [ci skip]\""
                        }
                        else if (BRANCH_NAME == DEV_BRANCH.beta) {
                            def baseVersion = sh returnStdout: true, script: 'node -e "console.log(require(\'./package.json\').version.split(\'-\')[0])"'
                            def preReleaseVersion = baseVersion.trim() + "-beta." + new Date().format("yyyyMMddHHmm", TimeZone.getTimeZone("UTC"))
                            sh "npm version ${preReleaseVersion} -m \"Bumped pre-release version to ${preReleaseVersion} [ci skip]\""
                        }
                    }

                    // For debugging purposes
                    echo "Current Status of ${BRANCH_NAME}"
                    sh "git status"

                    // Do the push with credentials from the GIT ID
                    withCredentials([usernameColonPassword(credentialsId: GIT_CREDENTIALS_ID, variable: 'TOKEN')]) {
                        sh "git push https://${TOKEN}@${rmProt(GIT_REPO_URL)} ${BRANCH_NAME} --follow-tags"
                    }

                    script {
                        // We only get here if the source was updated
                        GIT_SOURCE_UPDATED = "true"
                    }
                }
            }
        }
        /************************************************************************
         * STAGE
         * -----
         * Deploy
         *
         * TIMEOUT
         * -------
         * 5 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.deploy is true
         * - The build is still successful and not unstable
         *
         * DESCRIPTION
         * -----------
         * Deploys the current build as an npm package to an npm registry. The
         * build will be tagged as beta.
         *
         * OUTPUTS
         * -------
         * npm: A package to an npm registry
         ************************************************************************/
        stage('Deploy') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.deploy
                    }
                    expression {
                        return currentBuild.resultIsBetterOrEqualTo(BUILD_RESULT.success)
                    }
                    expression {
                        return GIT_SOURCE_UPDATED == 'true' || RELEASE_BRANCHES.contains(BRANCH_NAME)
                    }
                }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    echo 'Deploy Binary'
                    withCredentials([usernamePassword(credentialsId: ARTIFACTORY_CREDENTIALS_ID, usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh "rm -f .npmrc"
                        sh "rm -f ~/.npmrc"

                        // Set the SCOPED registry and token to the npmrc of the user
                        sh "npm config set ${TARGET_SCOPE}:registry ${DL_URL.artifactory}"
                        sh "expect -f ./jenkins/npm_login.expect $USERNAME $PASSWORD \"$ARTIFACTORY_EMAIL\" ${DL_URL.artifactory} ${TARGET_SCOPE}"

                        script {
                            if (BRANCH_NAME == DEV_BRANCH.master) {
                                sh "npm publish --tag daily"
                            }
                            else {
                                sh "npm publish --tag ${BRANCH_NAME}"
                            }
                        }
                        sh "npm logout --registry=${DL_URL.artifactory} --scope=${TARGET_SCOPE}"
                        sh "rm -f ~/.npmrc"
                    }
                }
            }
        }
        /************************************************************************
         * STAGE
         * -----
         * Smoke Test
         *
         * TIMEOUT
         * -------
         * 5 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.smoke_test is true
         * - The build is still successful and not unstable
         *
         * DESCRIPTION
         * -----------
         * Install the new pulished plugin and run some simple command to validate
         *
         ************************************************************************/
        stage('Smoke Test') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.deploy
                    }
                    expression {
                        return currentBuild.resultIsBetterOrEqualTo(BUILD_RESULT.success)
                    }
                    expression {
                        return RELEASE_BRANCHES.contains(BRANCH_NAME)
                    }
                }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    echo "Smoke Test"
                    script {
                        withCredentials([usernamePassword(credentialsId: ARTIFACTORY_CREDENTIALS_ID, usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                            sh "rm -f .npmrc"
                            sh "rm -f ~/.npmrc"

                            // Set the registry and token to the npmrc of the user
                            sh "npm config set ${TARGET_SCOPE}:registry ${DL_URL.artifactory}"
                            sh "expect -f ./jenkins/npm_login.expect $USERNAME $PASSWORD \"$ARTIFACTORY_EMAIL\" ${DL_URL.artifactory} ${TARGET_SCOPE}"

                            // Install the plugin
                            script {
                                if (BRANCH_NAME == DEV_BRANCH.master) {
                                    sh "zowe plugins install ${TARGET_SCOPE}/db2@daily"
                                } else {
                                    sh "zowe plugins install ${TARGET_SCOPE}/db2@${BRANCH_NAME}"
                                }
                            }
                            sh "npm logout --registry=${DL_URL.artifactory} --scope=${TARGET_SCOPE}"
                            sh 'rm -f ~/.npmrc'
                        }
                    }

                    sh "zowe plugins list"
                    sh "zowe db2"
                    sh "zowe db2 call"
                    sh "zowe db2 execute"
                    sh "zowe db2 export"
                }
            }
        }
        /************************************************************************
         * STAGE
         * -----
         * Create Bundle
         *
         * TIMEOUT
         * -------
         * 5 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.create_bundle is true
         * - The current branch part of RELEASE_BRANCHES
         * - The build is still successful and not unstable
         *
         * DESCRIPTION
         * -----------
         * Creates a self-contained tgz archive so that the package can be
         * installed offline. It does this by calling a node script in
         * ./jenkins/configure-to-bundle.js which creates the needed
         * bundledDependencies property within the package.json of the project.
         *
         * After the package.json is updated, we run the `npm pack` command and
         * archive it under the name generated by the JS file.
         *
         * OUTPUTS
         * -------
         * ${package_name}-${package_version}-bundled.tgz:
         *
         * A self-contained npm package install file.
         ************************************************************************/
        stage('Create Bundle') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.create_bundle
                    }
                }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    echo 'Archiving bundled binary file'

                    script {
                        // This script's last line of output will be the name
                        // that should be given to the stored archive.
                        def archiveName = sh([
                                returnStdout: true,
                                script: 'node ./jenkins/configure-to-bundle.js'
                        ]).trim()

                        echo 'Output from configure-to-bundle.js script'
                        echo archiveName
                        archiveName = archiveName.tokenize().last()

                        // Create the bundled package. The last line of this
                        // command is the name of the package that was generated.
                        def bundleName = sh([
                                returnStdout: true,
                                script: 'npm pack'
                        ])

                        echo 'Output from npm pack command'
                        echo bundleName
                        bundleName = bundleName.tokenize().last()

                        // Rename to the proper name and archive the artifact
                        sh "mv ${bundleName} ${archiveName}"
                        archiveArtifacts archiveName
                    }
                }
            }
        }
    }
    post {
        /************************************************************************
         * POST BUILD ACTION
         *
         * Sends out emails and logs out of the registry
         *
         * Emails are only sent out when PIPELINE_CONTROL.ci_skip is false.
         *
         * Sends out emails when any of the following are true:
         *
         * - It is the first build for a new branch
         * - The build is successful but the previous build was not
         * - The build failed or is unstable
         * - The build is on the DEV_BRANCH.master
         *
         * In the case that an email was sent out, it will send it to individuals
         * who were involved with the build and if broken those involved in
         * breaking the build. If this build is for the DEV_BRANCH.master, then an
         * additional set of individuals will also get an email that the build
         * occurred.
         ************************************************************************/
        always {
            script {
                def buildStatus = currentBuild.currentResult

                if (PIPELINE_CONTROL.ci_skip == false) {
                    try {
                        try {
                            sh("cp -rf /home/jenkins/.npm/_logs deploy-log")
                        } catch(e) {}

                        archiveArtifacts allowEmptyArchive: true, artifacts: 'deploy-log/*.log'

                        def previousBuild = currentBuild.getPreviousBuild()
                        def recipients = ""

                        def subject = "${currentBuild.currentResult}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
                        def consoleOutput = """
                        <p>Branch: <b>${BRANCH_NAME}</b></p>
                        <p>Check console output at "<a href="${RUN_DISPLAY_URL}">${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>"</p>
                        """

                        def details = ""

                        if (previousBuild == null) {
                            details = "<p>Initial build for new branch.</p>"
                        } else if (currentBuild.resultIsBetterOrEqualTo(BUILD_RESULT.success) && previousBuild.resultIsWorseOrEqualTo(BUILD_RESULT.unstable)) {
                            details = "<p>Build returned to normal.</p>"
                        }

                        // Issue #53 - Previously if the first build for a branch failed, logs would not be captured.
                        //             Now they do!
                        if (currentBuild.resultIsWorseOrEqualTo(BUILD_RESULT.unstable)) {
                            // Archives any test artifacts for logging and debugging purposes
                            archiveArtifacts allowEmptyArchive: true, artifacts: '__tests__/__results__/**/*.log'
                            details = "${details}<p>Build Failure.</p>"
                        }

                        if (BRANCH_NAME == DEV_BRANCH.master) {
                            recipients = MASTER_RECIPIENTS_LIST

                            details = "${details}<p>A build of master has finished.</p>"

                            if (GIT_SOURCE_UPDATED == "true") {
                                details = "${details}<p>The pipeline was able to automatically bump the pre-release version in git</p>"
                            } else {
                                // Most likely another PR was merged to master before we could do the commit thus we can't
                                // have the pipeline automatically do it
                                details = """${details}<p>The pipeline was unable to automatically bump the pre-release version in git.
                                <b>THIS IS LIKELY NOT AN ISSUE WITH THE BUILD</b> as all the tests have to pass to get to this point.<br/><br/>

                                <b>Possible causes of this error:</b>
                                <ul>
                                    <li>A commit was made to <b>${DEV_BRANCH.master}</b> during the current run.</li>
                                    <li>The user account tied to the build is no longer valid.</li>
                                    <li>The remote server is experiencing issues.</li>
                                </ul>

                                <i>THIS BUILD WILL BE MARKED AS A FAILURE AS WE CANNOT GUARENTEE THAT THE PROBLEM DOES NOT LIE IN THE
                                BUILD AND CORRECTIVE ACTION MAY NEED TO TAKE PLACE.</i>
                                </p>"""
                            }
                        }

                        if (details != "") {
                            echo "Sending out email with details"
                            emailext(
                                    subject: subject,
                                    to: recipients,
                                    body: "${details} ${consoleOutput}",
                                    recipientProviders: [[$class: 'DevelopersRecipientProvider'],
                                                         [$class: 'UpstreamComitterRecipientProvider'],
                                                         [$class: 'CulpritsRecipientProvider'],
                                                         [$class: 'RequesterRecipientProvider']]
                            )
                        }
                    } catch (e) {
                        echo "Experienced an error sending an email for a ${buildStatus} build"
                        currentBuild.result = buildStatus
                    }
                }
            }
        }
    }
}
