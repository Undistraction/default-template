# Default Template

This is a script to bootstrap a new lib with all the files needed to begin.

## Files

It will copy the files located in `/files` directly:

* .babelrc
* .eslintignore
* .eslintrc
* .gitignore
* .prettierignore
* .prettierrc
* .travis.yml
* jest.config.js

## Templates

It will populate placeholders for files within the `/templates` directory with data from `author.config.js` and the name of the project you will supply via the prompt when you run the script.

* LICENSE.md
* package.json
* README.md
* rollup.config.js

Note: NPM seems to have an issue with including a file called `package.json` and silently fails to copy it and any remaining files in the `templates/` dir. To work around this and for clarity, all files in the `templates/` should use a `.template.` extension before any of their own extensions. This extension will be removed when the files are copied over.

## Install

Install the package globally with:

```
yarn global add @undistraction/default-template
```

Run from the command line from inside the root directory of a new project.

```sh
default-template-init
```

## Customising

If you want to use for your own projects:

* fork.
* rename the package.
* add your own details to `author.config.js`.
* edit or add files to `/files` and `/templates`.
* 'npm publish'
* install as a global package
* use `default-template-init` in the root of a project as outlined above.

## Notes

* The script will not overwrite anything. If it finds that a file already exists, it will quit with an error containing the filepath of the problematic file.

* The script uses `process.cwd()` as the target destination which will be whatever directory the script is called from.

* Files inside the `/templates` dir can have tokens added in the form: `#{name}`. The script uses `author.config.js` to replace these tokens, and uses a flattened key path as the key value, so the key will be `author.github.username` and this should be used as the token name.
