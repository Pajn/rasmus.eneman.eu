'use strict';

const path = require('path');
const handlebars = require('handlebars');
const handlebarsLayouts = require('handlebars-layouts');
const jsdom = require('jsdom').jsdom;
const prism = require('./prism.js');
const Metalsmith = require('metalsmith');
const assets = require('metalsmith-assets');
const browserSync = require('metalsmith-browser-sync');
const changed = require('metalsmith-changed');
const collections = require('metalsmith-collections');
const dateInFilename = require('metalsmith-date-in-filename');
const elevate = require('metalsmith-elevate');
const excerpts = require('metalsmith-excerpts');
const feed = require('metalsmith-feed');
const filenames = require('metalsmith-filenames');
const inPlace = require('metalsmith-in-place');
const layouts = require('metalsmith-layouts');
const mapsite = require('metalsmith-mapsite');
const markdown = require('metalsmith-markdown-remarkable');
const sass = require('metalsmith-sass');
const watch = require('metalsmith-watch');

handlebars.registerHelper(handlebarsLayouts(handlebars));
handlebars.registerHelper('prettyDate', date => date.getDate() + ' ' + date.toLocaleDateString('en', {month: 'long', year: 'numeric'}));
handlebars.registerHelper('iso', date => date.toISOString());
handlebars.registerHelper('stripTags', text => (jsdom(text).querySelector('p') || {}).textContent || '');
handlebars.registerHelper('limit', (length, text) => {
  if (text.length < length) return text;

  return text.substring(0, length).replace(/ [^ ]*$/, '');
});

const remarkable = {
  html: true,
  breaks: false,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && prism.languages[lang]) {
      return prism.highlight(str, prism.languages[lang]);
    } else {
      console.log(lang);
    }

    return ''; // use external default escaping
  },
};

function permalinks(options) {
  options = options || {};
  const toSkip = options.toSkip || /['']/g;
  const toReplace = options.toReplace || /[^a-z]/gi;
  const replacement = options.replacement || '-';

  return function permalinks(files, metalsmith, done) {
    Object.keys(files)
      .map(file => Object.assign(files[file], {oldName: file}))
      .filter(file => file.permalink !== false)
      .filter(file => file.title !== undefined)
      .forEach(file => {
        if (!file.permalink) {
          file.permalink = file.title
            .toLowerCase()
            .replace(toSkip, '')
            .replace(toReplace, replacement)
            .replace(new RegExp('\\' + replacement + '+', 'g'), replacement);
        }

        const newName = path.join(path.dirname(file.oldName), file.permalink, 'index.html');

        files[newName] = file;
        delete files[file.oldName];
      });

    done();
  };
}

function rename(options) {
  const from = options.from;
  const to = options.to;
  const insertionPoint =  /\$(\d+)/g;
  return function rename(files, metalsmith, done) {
    Object.keys(files)
      .filter(file => from.test(file))
      .forEach(oldName => {
        let newName = to;
        let groups = from.exec(oldName);
        let match;
        while (match = insertionPoint.exec(to)) {
          let insertion = match[1];
          newName = newName.replace('$' + insertion, groups[+insertion]);
        }

        files[newName] = files[oldName];
        delete files[oldName];
      })
    done();
  };
}

Metalsmith(__dirname)
  .metadata({
    site: {
      title: 'Rasmus Eneman',
      url: 'https://rasmus.eneman.eu',
      description: 'Studying web developer and politically interested',
    }
  })
  .use(changed())
  .use(dateInFilename())
  .use(collections({
    posts: {
      pattern: 'posts/**/*',
      sortBy: 'date',
      reverse: true,
    },
  }))
  // .use((files, metalsmith, done) => {
  //   const foundFiles = [];
  //   const posts = metalsmith.metadata().collections.posts;
  //   posts.forEach((file, index) => {
  //     if (foundFiles.indexOf(file.title) !== 1) {
  //       posts[index] = undefined;
  //     } else {
  //       foundFiles.push(file.title);
  //     }
  //   });
  //
  //   metalsmith.metadata().collections.posts = posts.filter(post => !!post)
  //   done();
  // })
  .use(elevate({pattern: 'posts/**/*'}))
  .use(markdown('full', remarkable))
  .use(permalinks())
  .use(excerpts())
  .use(filenames())
  .use(layouts({
    engine: 'handlebars',
    default: 'post.hbs',
    partials: 'layouts/partials',
    pattern: '**/*.html',
  }))
  .use(inPlace({
    engine: 'handlebars',
    partials: 'layouts/partials',
    pattern: '*.hbs',
  }))
  .use(assets({
    source: './assets',
    destination: './assets',
  }))
  .use(rename({
    from: /(.+)\.hbs/,
    to: '$1.html',
  }))
  .use(feed({collection: 'posts'}))
  .use(rename({
    from: /rss\.xml/,
    to: 'rss/index.xml',
  }))
  .use(sass())
  .use(mapsite({
    hostname: 'https://rasmus.eneman.eu',
    omitIndex: true,
    priority: '0.8',
    modifiedProperty: 'date',
  }))
  // .use(watch({
  //   paths: {
  //     "assets/**/*": true,
  //     "layouts/**/*": '**/*.html',
  //     "src/**/*": true,
  //   },
  // }))
  // .use(browserSync({
  //   files: ['assets/**/*', 'layouts/**/*', 'src/**/*'],
  // }))
  .build(function(err){
    if (err) throw err;
  });
