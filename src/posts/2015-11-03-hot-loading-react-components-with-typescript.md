---
title: Hot loading React components with Typescript
permalink: hot_loading_react_components_with_typescript
---
For my project I choose to use Webpack as a module loader, this is because I want [hot loading](https://github.com/gaearon/react-hot-loader) which means that updated components gets replaced without a complete page refresh. I do also want Typescript for better help from the editor and the ability to statically sanity check the code.

Because Typescript doesn't handle down emitting (making a newer ES syntax work in ES5) of async/await which is a feature I want. I do need to take the TS output and run it through Babel as well to get code usable in todays browsers.

Every time you use new tools or mix tools in a new way you'll learn something, in some cases this is great but in other cases you wish you didn't need that knowledge. Configuring this build chain was one of those...

After several hours of debugging I finally understood why Typescript>Babel didn't work when plain Typescript as well as plain Babel worked I realized that somehow Babel does read the settings in .babelrc if it's second in the loader array of Webpack.
When I finally understood the problem it were quickly solved however. If I instead include Babels settings in the loader configuration the chain magically started to work.
With that done getting hot loading to work was just a matter of adding react-hot to the loaders array as I already passed the --hot argument to webpack dev server.

After that I configured some postinstall actions to create a tsconfig file, install third party typings and running tsconfig_glob.

    "postinstall:copy_base_config": "cp tsconfig.base.json tsconfig.json",
    "postinstall:install_typings": "tsd install",
    "postinstall:tsconfig_glob": "npm run tsconfig_glob",

The reason I store my Typescript settings in a file named `tsconfig.base.json` is that Typescript wants an array of all files in the project in the `tsconfig.json` file which creates unnecceray diffs and merge conflicts in git. Instead I use globs to match my files and the tsconfig_glob package to generate the files array.

See my full webpack config in the project repo at <https://github.com/Pajn/Culinam/>
