# Default Template

This is a script to bootstrap a new app with all the files needed to begin.

It will copy the files located in `/files` directly:

* .babelrc
* .eslintignore
* .eslintrc
* .gitignore
* .prettierignore
* .prettierrc
* .travis.yml
* jest.config.js

It will populate placeholders for files within the `/templates` directory with data from `author.config.js` and the name of the project you will supply via the prompt when you run the script.

## Install

Install globally with:

```
yarn add @undistraction/default-template -g
```

Run from the command line from inside the root of a new project.

```sh
default-template-init
```

## Note

The script will not overwrite anything. If it finds that a file already exists, it will quit with an error containing the filepath of the problematic file.
