module.exports = {
    branches: [
        {
            name: "next",
            prerelease: true,
            channel: "next",
            level: "major",
            devDependencies: {
                "@zowe/cli": "next",
                "@zowe/imperative": "next",
                "@zowe/cli-test-utils": "next"
            }
        },
        {
            name: "master",
            level: "minor",
            devDependencies: ["@zowe/cli", "@zowe/imperative", "@zowe/cli-test-utils"]
        },
        {
            name: "zowe-v1-lts",
            level: "patch",
            devDependencies: ["@zowe/cli", "@zowe/imperative"]
        }
    ],
    plugins: [
        "@octorelease/changelog",
        ["@octorelease/npm", {
            aliasTags: {
                latest: ["zowe-v2-lts"]
            },
            pruneShrinkwrap: true
        }],
        ["@octorelease/github", {
            checkPrLabels: true
        }],
        "@octorelease/git"
    ]
};