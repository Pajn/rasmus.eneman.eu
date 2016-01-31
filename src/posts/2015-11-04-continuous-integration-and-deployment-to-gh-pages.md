---
title: Continuous Integration and Deployment to gh-pages
---
In the RIA course we will publish our application on Github using the gh-pages branch. I doesn't like to include build artefacts or similar data in my source code repo, partly because it creates ugly and hard to read diffs (And I like to read them when I view the history) but mostly because they create merge conflicts that's usually a pain to handle. To solve this I decided early on to develop on master and only publish the built version to gh-pages. However I doesn't like manual labour, the flow of work, commiting, changing branch, building and commiting again doesn't speak to me so I decided to try to setup Travis to handle the boring parts.

The first and most important step in continuous deployment is continuous integration.

>Continuous Integration is the practice of merging development work with a Master/Trunk/Mainline branch constantly so that you can test changes, and test that changes work with other changes.
>
[Michael Chletsos](http://blog.assembla.com/AssemblaBlog/tabid/12618/bid/92411/Continuous-Delivery-vs-Continuous-Deployment-vs-Continuous-Integration-Wait-huh.aspx)

This is important because if every change automatically is built and pushed to gh-pages, even if it blows up on the start page, it goes live for everyone to see. Embarrassing ;)

Getting started with Travis as a CI is very simple for Javascript projects. Just go to travis.org and "activate" the repo and then create a `.travis.yml` file in the root of the repo with the content `language: node_js`.
Travis will by default use `npm install` to install your dependencies and `npm test` to run your tests. If you want to modify the behaviour you can set `before_script` or `script` in `.travis.yml`.

## Continuous Deployment
After Travis were set up as a CI I started to investigate how to use it for deployment. As this were new ground for me I needed to answer a few questions

1. How do I run something if, and only if, the build has succeeded?
2. How do I authorize against Github so that I can push?
3. How do I make sure that not everyone in the world get push access as both the repo and the Travis output is open?

The answer to question one were very easy, Travis has a `after_success` hook that can be added to the `.travis.yml` in the same way as `before_script` or `script`.

In question two I got saved by Github having HTTP basic authorization support for its https url, meaning that the credentials can be added right to the url using the format `https://USERNAME:PASSWORD@github.com/REPO_OWNER/REPO_NAME.git`.

Question three turned into several answers. First the password in the url can be replaced with a personal access token which you can get from Github and limit the access to only repo access. To keep the token secure I use an environment variable in Travis that is not logged to the output which can be set from the webpage.
Third, as git logs the url to stdout on push I need to quiet it, the `--quiet` flag is not enough though as git will instead log it to stderr if some problem occurs. Therefore I used shell redirects instead. By putting `> /dev/null 2>&1` behind the push command output to both stdout and stderr will be redirected to `/dev/null` and get thrown away.

### Handling merge conflicts
I do not want to end up in a situation were there is an merge conflict and Travis because I have no way of solving it there.
Thankfully I does not care about the history of the gh-pages branch which allows to remove that risk completely.
On every deploy I will create a new repository on Travis, add the build artefacts and then forcefully push that to the gh-pages branch. This will make it look like there have only ever been one single commit to it, but I couldn't care less :)
Because a single bug could destroy the complete history of the master branch I went ahead and "protected" it before trying out the script, with that no direct pushes to master is allowed and every change must come in form of a PR that after verification of Travis can be merged using the Github interface.

### Explanation of the script
I ended up calling a script, `deploy.sh` in `after_success` which part by part looks like this:
```bash
if [ "$TRAVIS_BRANCH" != "master" ]
then
  exit 0

elif [ "$TRAVIS_PULL_REQUEST" != "false" ]
then
  exit 0
fi
```
This checks that the current build is on master and is not a pull request. This is because Travis will build all pull request but they should only be deployed after they have been merged.

```bash
set -e
npm run build
cd dist
```
I set up the script to end if any command errors, that is because I only want to deploy succeeded builds. After that I use the build specified in my `package.json` and navigate to the folder hosting its artefacts.

```bash
git init
git checkout -b gh-pages
git config --global user.email "pie.or.paj@gmail.com"
git config --global user.name "Travis"
git remote add deploy "https://$GITHUB_AUTH@github.com/Pajn/Culinam.git"
```
This creates a new git repository and changes it to the gh-pages branch. After that I configure user information in git which is required to commit. and finally I add the github repository as a remote named deploy. Notice the `$GITHUB_AUTH` which is where the Github credentials is specified from the environment variable.

```bash
git add -A
git commit -am "Deploy of build #$TRAVIS_BUILD_NUMBER of commit $TRAVIS_COMMIT"
git push deploy gh-pages --force > /dev/null 2>&1
```
Then I add all files and commits them. Travis sets environment variables with information on what is currently building, I use the in the commit message so I can see what version that have been deployed.
Finally I push the commit to Github which will publish the build.
