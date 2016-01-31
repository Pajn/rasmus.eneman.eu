---
title: Prerender the app shell
---
I'm continuing my course on examining the performance optimisations that can be done on a React application. This time I have looked at load time. With a client rendered application the browser first have to fetch the HTML, parse it to find out the CSS and Javascript to get, fetch those and then run the Javascript which will render the page. During all of this, the user will look at a white page.
So how can we improve it?

Lets examine what is taking time:
If the markup needed to render the page is included in the HTML, the browser doesn't need to first run the Javascript to figure out what to render. And if it doesn't need to run the Javascript, it doesn't even need to wait for it to download. If the CSS needed to render the page is included in the HTML as well it doesn't even need to wait for the CSS to download and can start to render the page as soon as it gets the HTML.

React supports server side rendering which can be used to produce the needed markup, however we are hosting our projects on gh-pages so we have no possibility to run code on the server. What we do have the possibility to do however is to run code in the build process, which means that we can prerender the application there.
In the build process we have no knowledge of the application data or route the user visited so the only thing we can prerender is the application shell, the parts of the application that stays the same between all pages. For my project the application shell is a basic menu and a background color.

As I'm using inline CSS in the Javascript, the CSS wont be an issue. In the rendered markup the CSS will be included in style attributes and only CSS required for that first render will be included which is important for file size.

To render my application offline I needed to do some changes to the setup. First I needed to extract the route configuration, so I changed
```jsx
render(
  <Router>
    <Route path='/' component={App}>
      <IndexRedirect to='/kitchen' />
      <Route path='cashier' component={Cashier}>
        <Route path='dishes' component={Dishes} />
        <Route path='drinks' component={Drinks} />
      </Route>
      <Route path='kitchen' component={Kitchen} />
    </Route>
  </Router>,
  document.getElementById('app')
);
```
to
```jsx
export function routes() {
  return (
    <Route path='/' component={App}>
      <IndexRedirect to='/kitchen' />
      <Route path='cashier' component={Cashier}>
        <Route path='dishes' component={Dishes} />
        <Route path='drinks' component={Drinks} />
      </Route>
      <Route path='kitchen' component={Kitchen} />
    </Route>
  );
}

render(<Router>{routes()}</Router>, document.getElementById('app'));
```
This makes it possible to reuse the same routes in the build process or on a server. I also needed to make sure that React didn't try to render itself to a DOM that doesn't exist so I had to guard the render statement so that it's only executed in a browser. I did that by checking for the existence of a document
```jsx
if (window.document) {
  render(<Router>{routes()}</Router>, document.getElementById('app'));
}
```

As react-router have support have for server side routing it's easy to tell it to render a special route that only display the application shell and nothing else.
```jsx
import {match, RoutingContext} from 'react-router';
import {renderToString} from 'react-dom/server';
import {routes} from '../.tmp/ts/index.js';

match({routes: routes(), location: '/shell'}, (error, redirectLocation, renderProps) => {
  console.log(renderToString(<RoutingContext {...renderProps} />));
});
```

That was the basic concepts I went though to get the prerender working. Just ask if you want more details, I'm more interested in if the load time improved and how much? I used [Webpagetest](http://www.webpagetest.org/) to measure to load times with the default settings of location Dallas and browser Chrome.
The numbers I got, before:
![](/assets/images/2015/11/before.png)
and after:
![](/assets/images/2015/11/after.png)
Look at the start render numbers, it's cut in half for the first view and is nearly instant for repeated views (I'll get to that later). The load time went up a bit because now there are a bit more data to download as the JS bundle still contains all logic for rendering the shell. The number lie a bit though as we can see on the first byte numbers, because I have made no changes to the server they should be the same. But reality is never perfect and network conditions change so the load time numbers look a bit worse than they actually are.

But what are in that start render? It can be seen by disabling the Javascript
![](/assets/images/2015/11/Screen-Shot-2015-11-26-at-13-00-40.png)
While that isn't perfect it's a lot better than a fully white page. The time until the application is usable haven't changed however, for that the JS still needs to run. But the load will feel faster for a user. A server side renderd version would be better though as it could render the full markup for the requested page and not just the shell.

### Repeated views
As can be seen in the numbers above, the repeated view is much faster than the first one. Why is that?
It's because I have added the [offline-loader](https://github.com/NekR/offline-plugin/) Webpack plugin which will produce an appcache manifest and a service worker that will store the application so that it can be used offline, without internet access. This also removes the need for the browser to download all resources when online and can start to render the application instantly.

### Further info
If you are interested in the subject of load time I can highly recommend the video [Supercharging page load (100 Days of Google Dev)](https://www.youtube.com/watch?v=d5_6yHixpsQ) with Jake Archibald for details on how he made an webapp with great load time performance. As well as the talk [You should use [insert library/framework], it's the bestestest!](https://www.youtube.com/watch?v=_yCz1TA0EL4) with Paul Lewis that touches the subject of what we give up to use a framework.
