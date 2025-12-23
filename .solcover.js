module.exports = {
  skipFiles: [
    "node_modules/",
    "test/",
    "artifacts/"
  ],
  mochaOpts: {
    grep: "^(?!.*; delegation)",
    timeout: 200000
  }
};
