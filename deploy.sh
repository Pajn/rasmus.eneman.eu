#!/bin/sh

set -e

node metalsmith.js build
cd build
git init
git remote add origin git@github.com:beanloop/site.git
git checkout -b gh-pages
git add -A
git commit -am 'Deploy'
git push origin gh-pages --force
