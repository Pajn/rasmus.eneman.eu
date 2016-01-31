---
title: Debugging with devtools
date: 2015-12-03T19:20:00
---
There were a couple of complains about debugging in Javascript in the Slack channel. As I think
Javascript has the next best (after Dart, it's hard to beat the [Observatory](https://dart-lang.github.io/observatory/get-started.html))
debugging tools available I thought that I should make a post about using the debugger in Chrome.

The first thing to do is make sure that you have source maps enabled, because otherwise you'll
have a bad time. If you are using Webpack you can just enable them by adding
`devtool: 'source-map',` to your config.

Now open up the Chrome dev tools and go to the "Sources" tab, here you can browse your files in
the left panel. Your files is probably in `webpack://./app`. After you have opened a file you can
add a breakpoint by clicking on the line number. When Chrome reaches that breakpoint, the execution
of all Javascript will stop and your page will display "Paused in debugger". In the dev tools you'll
see:
[![](/assets/images/2015/12/breakpoint.png)](/assets/images/2015/12/breakpoint.png)
As you can see, every executed line have been annotated with the values of the variables of that
line. On the right you'll see a Scope pane with the local scope opened by default. In here all
variables defined in the local scope will be shown. Below the local scope all other accessable
scopes are shown in order with the global scope at the bottom. Every object will have an arrow which
can be used to open that object and inspect all its properties. Non-enumberable properties will be
slightly faded out. If you get to a function object you'll even be able to access its scopes!

If you hover over a variable in the code, a popup with the value of that variable will be shown.
In the popup you can navigate objects and functions just as in the Scope pane.

[![](/assets/images/2015/12/stackframe.png)](/assets/images/2015/12/stackframe.png)
Above the Scope pane there's a Call stack pane. Inside this pane you'll see all stack frames that
have led up to the breakpoint. By clicking on a stack frame you'll be taken to the line where the
call the the next function occurs. Also, the scopes pane is updated to reflect the scope of the
current stack frame so that you can inspect everything that its in it scope.

### Changing values when running
When you have stopped on a breakpoint, the console will now be in the same scope as you are currently
inspecting. That means that you can access the variables of the local scope in the console and also
change them! Just reassign the variable in the console and continue the execution of the program.
By using the call stack pane you can even open an older stack frame and access that in the console.
![](/assets/images/2015/12/console.png)

### Stepping
At the top of the right panel there are a few buttons to step through your code
![](/assets/images/2015/12/step.png)
The first one that looks like a play button will continue the execution of the program as normal.
The second one will execute the function you are on, and you can continue debugging on the line
below. The third one will enter the function so that you can continue debugging inside that function.
The fourth will execute the rest of the current function and you can continue debugging as soon as
it have returned.

Then you have two buttons to control the debugger on a higher level. The first will disable stopping
on breakpoints and the second will make the browser stop when uncaught exceptions are thrown. When
that option are enabled a checkbox will be displayed where you can enable stopping on caught
exceptions as well.

The async checkbox enables better debugging whit promises, you'll probably want to always keep that
checked.

### I did accidentally step over a function I wanted to enter?
If you stepped to far, or just want to debug something before your breakpoint you can right click
on a stack frame in the call stack pane and choose restart frame. That will put you at the top of
the function for that stack frame.

### Event listeners
If you want to debug an event listener you can enable an event listener breakpoint. Just open the
event listener breakpoints pane and check the event you want to break on (for example Mouse>click).
Now perform the action that would trigger the event (for example click on you element), and the
debugger will stop on every handler that are triggered by that event. Unfortunately it's hard to
follow the event from the DOM with React as it goes through a lot of React code before your handler
is reached.

With React you can instead use the React developer tools and navigate to the Component. You can then
see the function that you have passed as a prop and can right click on it to show its source.
