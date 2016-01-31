---
title: Performance and React
---
An old blog post from Paul Lewis, [React + Performace = ?](https://aerotwist.com/blog/react-plus-performance-equals-what/) were brought up in the Facebook group _Kodapor_. In this post Paul describes how he have benchmarked React against vanilla JavaScript and we could sadly see that the performance of React was much worse than its vanilla counterpart.

I decided that I should redo the benchmark with two following modifications:

1. The latest version of React (0.14.3)
2. shouldComponentUpdate

`shouldComponentUpdate` is a method which can be added to a component, and if it exists React will consult it whenever a component should be updated or not. This can, according to the [React documentation](https://facebook.github.io/react/docs/advanced-performance.html) make things faster.
I'm using the exact same benchmark as Paul for the vanilla and 0.13 test. For 0.13 with `shouldComponentUpdate` I only added
```js
shouldComponentUpdate: function(nextProps, nextState) {
  return this.props.image !== nextProps.image;
},
```
to the FlickrImage component and
```js
shouldComponentUpdate: function(nextProps, nextState) {
  return this.state.data !== nextState.data;
},
```
to the FlickrImages component. For the 0.14 tests I added the react-dom script tag and changed `React.render` to `ReactDOM.render`. Those are the only modifications done to the original code from Paul. I run all tests on my Nexus 5 using Chrome 46.

#### The latest version of React
So are there any optimizations in the newer version of React?
![](/assets/images/2015/11/image.png)
The latest version seems a bit better, but we are still far of vanilla js.

#### shouldComponentUpdate?
![](/assets/images/2015/11/image-1-.png)
While `shouldComponentUpdate` is faster with many components on the page, it seems to be much slower with only a few components which isn't very good... Why it turns out this way I don't know but I reproduce the results every time I run the tests so they seem stable.

#### The best of both worlds?
So what happens if we use the latest version of React together with `shouldComponentUpdate`?
![](/assets/images/2015/11/image-3-.png)
Good things, it turn out. Not only got we rid of that huge bumb with a few components but we also beat vanilla JS when we reached 800 components.

### Conclusions
It seems like Pauls conclusion that React has significant costs, especially on mobile is no longer valid. From this simple test React seems to close the gap on vanilla.
However I don't know if the benchmark hits a golden and now optimized line. Maybe we'll fall of the optimization if more functionality is added?
With the `shouldComponentUpdate` results on 0.13 it's clear that the mantra "always test" is true, a feature that in theory should give higher performance did instead cost very much until the amount of components increased.

Even if these results are not valid for the general apps out there it's interesting to see how much the performance have improved and I wish to see new benchmarks that find new problems for the React team to solve.
