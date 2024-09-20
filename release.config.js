module.exports = {
    branches: [
        {
            name: "master",
            prerelease: true,
            channel: "next",
            level: "none",
            devDependencies: {
                "@zowe/cli": "zowe-v3-lts",
                "@zowe/imperative": "zowe-v3-lts",
                "@zowe/cli-test-utils": "zowe-v3-lts"
            }
        },
        {
            name: "zowe-v?-lts",
            level: "patch",
            devDependencies: ["@zowe/cli", "@zowe/imperative"]
        }
    ],
    plugins: [
        "@octorelease/changelog",
        ["@octorelease/npm", {
            aliasTags: {
                latest: ["zowe-v2-lts"],
                next: ["zowe-v3-lts"],
            },
            pruneShrinkwrap: true
        }],
        ["@octorelease/github", {
            checkPrLabels: true
        }],
        "@octorelease/git"
    ]
};