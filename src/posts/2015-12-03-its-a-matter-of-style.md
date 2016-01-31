---
title: It's a matter of style
---
Since I have previously have used React Native I was already familiar with inline CSS and continued on using it with React as I really appreciated it. I think inline styles is a great way to solve reuse and sharing of styles, ES6 have a great module system and with Object.assign or object spread it's really easy to mixin common styles. It's also clean and easy to make the styling depend on state and props by using Object.assign or ternary in the render method. So I really liked the inline styles idea that I had learned in React Native, however when I entered the harsh world of the web things started to change.

```jsx
<Widget grid={grid} configuration={configuration}>
  <div style={styles.container}>
    <h1 style={Object.assign(styles.number, useSmallFont && styles.small)}>{number}</h1>
    {unit && <h2 style={styles.unit}>{unit}</h2>}
  </div>
</Widget>
```
_Looking good, for this case_

In a world that's enterable from a device with a mouse, you really want hover support. And with the diversity of the web you'll need media queries sooner or later. I did also end up wanting to set some styles that apply to all elements of a certain type. All of this is impossible to do with inline styles, and inline styles is really a different world than CSS files so if you start to mix both of them things are getting ugly real fast. [Radium](https://github.com/FormidableLabs/radium) tries to solve some of these problems, but I don't really like having event listeners for mouseenter and mouseleave on all elements that users `:hover`. It also did not solve the tag-styles problem.

#### CSS modules
As I wanted something better than what inline styles were giving I went on a search and found a thing called CSS modules. The idea is that you write your CSS in CSS files (or with a preprocessor of your choice) but instead of adding them all to the page using `<link>` you instead import them in your component. They will be added automatically to the page when you import them and you'll get an object with all classes in it that you can use to apply the styles to your components. I created a simple classNames helper to simplify merging styles in the render method so with that I can easily replace Object.assign.

The above example instead becomes:
```jsx
<Widget grid={grid} configuration={configuration}>
  <div className={styles.container}>
    <h1 className={classNames(styles.number, useSmallFont && styles.small)}>{number}</h1>
    {unit && <h2 className={styles.unit}>{unit}</h2>}
  </div>
</Widget>
```

#### Sharing styles?
As this pushes me back to CSS files I can't leverage the ES6 module system for sharing styles. CSS modules does have a a way to import and export stuff, but I did instead choose Sass with the `.scss` syntax. This is because the project I did this change on [Cetti](https://github.com/drager/cetti) uses the [mdl](http://getmdl.io) library which uses Sass, so by choosing Sass a lot of definitions can be imported and reused.

#### Component tag classes
There are some places where the component used either is unique or where the same style should be applied to all the components of that type. For example this:

```jsx
<Layout fixedDrawer>
  <Drawer title='Cetti' className={styles.drawer}>
    <Navigation className={styles.navigation}>
      {Object.entries(dashboards).map(([id, dashboard]) =>
          <Link to={`/${id}`} key={id}
                className={classNames(styles.navLink, id === params.id && styles.active)}>
            {dashboard.name}
          </Link>
      )}
    </Navigation>
  </Drawer>
  <Content className={styles.content}>
    {this.props.children}
  </Content>
</Layout>
```
I didn't like this very much so I created a simple Babel plugin that add those classes automatically (or rather Drawer gets styles.Drawer which make sure it doesn't clash with a class that is accidentally named drawer and should be applied and also makes it clear in the CSS that this case is special). That's avalible on Github as [babel-plugin-jsx-tagclass](https://github.com/Pajn/babel-plugin-jsx-tagclass). With that, the above code can be written as:
```jsx
<Layout fixedDrawer>
  <Drawer title='Cetti'>
    <Navigation>
      {Object.entries(dashboards).map(([id, dashboard]) =>
          <Link to={`/${id}`} key={id}
                className={classNames(styles.navLink, id === params.id && styles.active)}>
            {dashboard.name}
          </Link>
      )}
    </Navigation>
  </Drawer>
  <Content>
    {this.props.children}
  </Content>
</Layout>
```
_Which is much cleaner in my opinion._

#### Drawbacks
There are some things that still bugs me a bit with CSS modules. Firstly, it seems like the same class name can't be reused in different components. This is a bit silly as the class name is rewritten to something unreadable but for me, the same class name gets rewritten to the same thing in all files. I believe this is a bug though so I opened an [issue](https://github.com/webpack/css-loader/issues/198) about it. However this is probably an easy fix so I don't take it as too problematic right now.

Second, in the above code you see `styles.active` but in the CSS it's nested:
```scss
.navLink {
  // ...

  &.active {
    // ...
  }
}
```
I would like this nesting to persist in the styles object I get so that it's clear what "active" actually means.

Third, when everything was defined in Typescript I got intellisense on the style object as well as errors if I accessed a missing property. That's now gone. I have a theory that I should be able to create a tool that generates type definitions from the CSS modules so that I can again get that help, but for now it's gone.
