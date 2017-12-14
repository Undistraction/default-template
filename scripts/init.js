#!/usr/bin/env node

const report = require(`yurnalist`);
const replaceTokensInFile = require(`replace`);
const fs = require(`fs-extra`);
const path = require(`path`);
const {
  map,
  join,
  forEach,
  merge,
  chain,
  toPairs,
  fromPairs,
  compose,
  replace,
  toLower,
} = require(`ramda`);
const prompt = require(`prompt`);
const stringifyObject = require(`stringify-object`);

const config = require(`../author.config`);
const defaults = require(`./const`);

const buildError = message => new Error(message);

const PROMPT_PROPS = [
  {
    name: `projectName`,
    message: `Enter the Project Name`,
    validator: /^[a-zA-Z0-9\s-]+$/,
    required: true,
    warning: `Project Name must be only letters, spaces, or dashes`,
  },
];

// -----------------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------------

// Flatten an object into
const flattenObj = obj => {
  const go = obj_ =>
    chain(([k, v]) => {
      if (typeof v === `object`) {
        return map(([k_, v_]) => [`${k}.${k_}`, v_], go(v));
      }
      return [[k, v]];
    }, toPairs(obj_));
  return fromPairs(go(obj));
};

const toNPMName = compose(toLower, replace(` `, `-`));

const getCurrentYear = () => new Date().getFullYear();

const githubProjectURL = (username, projectName) =>
  join(`/`)([`https://github.com`, username, projectName]);

const shouldIncludeFile = file => path.basename(file) !== `.DS_Store`;

function copyFilesToDir(srcDir, destinationDir) {
  const items = fs.readdirSync(srcDir);
  const promises = map(item => {
    const srcFile = path.join(srcDir, item);
    const destinationFile = path.join(destinationDir, item);
    report.info(` - Copying File: '${srcFile}' to '${destinationFile}'`);
    return fs.copy(srcFile, destinationFile, {
      overwrite: false,
      errorOnExist: true,
      filter: shouldIncludeFile,
    });
  })(items);

  return Promise.all(promises);
}

// -----------------------------------------------------------------------------
// Copy Templates
// -----------------------------------------------------------------------------

const copyTemplatesToTemp = () =>
  fs
    .copy(defaults.TEMPLATE_DIR_PATH, defaults.TEMPLATE_DIR_TEMP_PATH)
    .then(() => {
      report.info(
        `Copied templates to temp dir: ${defaults.TEMPLATE_DIR_TEMP_PATH}`
      );
      return Promise.resolve();
    })
    .catch(error =>
      Promise.reject(buildError(`Couldn't copy files to temp dir: ${error}`))
    );

// -----------------------------------------------------------------------------
// Copy Files to Out Dir
// -----------------------------------------------------------------------------

const copyTemplatesToOutDir = () =>
  copyFilesToDir(defaults.TEMPLATE_DIR_TEMP_PATH, defaults.OUT_DIR_PATH)
    .then(() => {
      report.info(
        `Copied populated templates to out dir: ${defaults.OUT_DIR_PATH}`
      );
      return Promise.resolve();
    })
    .catch(error =>
      Promise.reject(buildError(`Couldn't copy files to temp dir: ${error}`))
    );

const copyOtherFiles = () =>
  copyFilesToDir(defaults.FILES_DIR_PATH, defaults.OUT_DIR_PATH)
    .then(() => {
      report.info(`Copied other files to out dir: ${defaults.OUT_DIR_PATH}`);
      return Promise.resolve();
    })
    .catch(error =>
      Promise.reject(
        buildError(`Couldn't copy other files to out dir: ${error}`)
      )
    );
// -----------------------------------------------------------------------------
// Cleanup
// -----------------------------------------------------------------------------

function cleanUp() {
  fs.removeSync(defaults.TEMPLATE_DIR_TEMP_PATH);
}

// -----------------------------------------------------------------------------
// Replace Tokens
// -----------------------------------------------------------------------------

function replaceToken([name, value]) {
  report.info(`replacing token '${name}' with '${value}'`);
  replaceTokensInFile({
    regex: `#{${name}}`,
    replacement: value,
    paths: [defaults.TEMPLATE_DIR_TEMP_PATH],
    recursive: true,
  });
}

// Replace tokens in place
function replaceTokens(replacements) {
  report.info(
    `Populating templates with config: ${stringifyObject(replacements)}`
  );
  forEach(replaceToken)(replacements);
}

// -----------------------------------------------------------------------------
// Populate Templates
// -----------------------------------------------------------------------------

function populateTemplates(promptConfig) {
  const dasherizedProjectName = toNPMName(promptConfig.projectName);
  const mergedConfig = merge(config, {
    project: {
      name: promptConfig.projectName,
      dasherizedName: dasherizedProjectName,
      repository: {
        url: githubProjectURL(
          config.author.github.username,
          dasherizedProjectName
        ),
      },
    },
    currentYear: getCurrentYear(),
  });
  const replacements = compose(toPairs, flattenObj)(mergedConfig);

  return replaceTokens(replacements);
}

// -----------------------------------------------------------------------------
// Prompt
// -----------------------------------------------------------------------------

function getUserConfig() {
  return new Promise((resolve, reject) => {
    prompt.start();
    prompt.get(PROMPT_PROPS, (error, result) => {
      if (error) {
        reject(buildError(`Problem with command prompt: ${error}`));
      }
      resolve(result);
    });
  });
}

// -----------------------------------------------------------------------------
// Entry
// -----------------------------------------------------------------------------

report.info(`Initialising new project at '${process.cwd()}'`);
copyTemplatesToTemp()
  .then(getUserConfig)
  .then(populateTemplates)
  .then(copyTemplatesToOutDir)
  .then(copyOtherFiles)
  .then(cleanUp)
  .catch(error => report.error(`Error initialising: ${error}`));
