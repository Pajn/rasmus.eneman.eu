---
title: I don't like classes
---
I started programming for normal computers using Python and were later introduced to Java.
While I have changed my views massively since that time there is one thing that only
recently have started to change, which is my view on classes. Classes is one of the very few
things I have missed in Javascript from my time with Java.  
However, Typescript have taught me a valuable lesson. What I like isn't classes it's a place in
the code that I can go to and look at a description of how the objects will look and behave.
I believe that I have made this misconception because of how classes are taught. I bet you
that you were introduced to classes in a very similar way as me, something similar to
>Classes are like a blueprint for objects. They describe how objects of that class look and behave.

This is sounds exactly as the thing that I like, but yet I don't like classes, why? Because that
statement is simply not true. Sure, classes do that too but their main usage is as factory.
The class not only describes how objects of that class look and behave, it's the only way to
create objects of that class. Even if you create objects that look and behave in the same way, they
are no good if they aren't created from that class. This is important as it makes your code much
more complicated and filled with boilerplate than what's needed.

For classical languages you'll need complicated libraries making use of reflection to map objects
to different things. I created one of those myself to map Dart objects to a database. And then
you'll need a different library to serve that object over a Websocket or a REST API. In JS or TS
however you'll just need `JSON.stringify` or similar construct. And to what use? TS have interfaces
which fulfill exactly the same need of a single place I can look at to see how the object look and
behave without have to use that as a factory every time I want an object.

Of course classes aren't completely useless. The factory problem is only a problem for entity
classes which you do want to create new instances of, store or transfer. For a service where you
only need one instance, classes do make sense. Their syntax for collecting a bunch of methods
together with a factory to inject dependencies is pretty nice. You could do it without a class but
why would you? You'll probably just end up re-implmenting classes in a non standard way.
