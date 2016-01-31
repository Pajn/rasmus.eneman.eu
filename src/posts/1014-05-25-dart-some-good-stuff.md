---
title: Dart, some good stuff
---
[Dart](https://www.dartlang.org/) is a new language for the web and in runs both on the client and the server, and it's fantastic!
So what is it that make it so good that one would pick it over a more proven and stable language?

First, it's new! Now that on itself isn't particularly good, what's good is that the Dart team have made a fabulous job at learning from previous art. Dart is inspired of Java, however the not so good parts is missing and other languages have been borrowed from instead, or new stuff have been invented.

I will now pick some of the features I  love in Dart and are missing in other languages. This isn't a complete list but is instead intended to highlight the features I like the most and haven't seen before.

### Optional types
Optional types is a wonderful invention that makes your code more readable and easier to type. In Dart you don't have to specify the type, but you may if you want. In the Dart community it's recommended to specify the type of the public API to make it easier to use and understand, but to not specify the type of your local variables as it's usually very simple to pick up the types anyway. Just as with unnecessary comments, unnecessary type specifications make your code cluttered and harder to follow.

Read more about Optional types on [Optional Types in Dart](https://www.dartlang.org/articles/optional-types/)

### Named constructors
Dart support named constructors, a very simple feature that makes your code more readable if your classes supports more than one constructor. Look at this code
```dart
new Point(10, 5);
new Point.fromJson({"x":10, "y": 5});
```
Having the Json compatible constructor named fromJson makes it very easy for everyone to understand what's going on. And we are still keeping the constructor that takes two coordinates  very simple as it's easy to understand anyway. Even if you used variables they would probably contain X and Y or something similar that makes it self explanatory anyway. We don't want to clutter already self explanatory code.

Read more about Named constrcturs on [Classes: Constructors](https://www.dartlang.org/dart-tips/dart-tips-ep-11.html)

### Implicit interfaces
We all know that it's a bad idea to bind directly to an implementation. Instead we should always bind to an interface. Now this will clutter your code if you only have one implementation of that interface as you need to write both the interface and the class implementing it. Everyone that have written Java know that you will clutter you code with
```java
List<Point> points = new ArrayList<Point>();
```
In Dart, all classes implicitly also is an interface. That means that List can be a class and it's still possible to create a custom implementation of it.
In other words, you'll only ever need to write implementations. And whenever you think that you binds to an implementation, you actually binds to the interface that class implements. Making your codebase simpler while still following good OO principles.

Read more about Implicit interfaces on [A Tour of the Dart Language](https://www.dartlang.org/docs/dart-up-and-running/contents/ch02.html#ch02-implicit-interfaces)

### The cascade operator
This beautiful thing is so elegant in its simplicity that you just have to love it. Look at this code
```dart
var point = new Point()
    ..x = 10
    ..y = 5;
```
Now you probably already know what it does, even if you have never seen it before. What it does is create a new Point object using the default constructor, and then assign the x and y variable to it before assigning a reference to the object to the point variable. While this is simple it simplifies the code because you don't need to have the constructor support every single variable on the object, just let it handle the required ones and then let the user set the reset using the cascade operator.

Read more on the cascade operator on [Method Cascades in Dart](http://news.dartlang.org/2012/02/method-cascades-in-dart-posted-by-gilad.html)

### Futures and Streams
Futures and Streams as two very nice techniques that together does a great job of dealing with asynchronous programming. Futures are a promise and are used where something happen exactly one time. For example that your GET request completed. Futures does also handle errors so that code listening on a future is promised to be notified that something completed or failed. Streams are for stuff that can happen multiple times, or never. Like that server listening for your GET request. It may receive one, a hundred, or it may not receive a single one.

Read more about Futures on [Use Future-Based APIs](https://www.dartlang.org/docs/tutorials/futures/) on Streams on [Use Streams for Data](https://www.dartlang.org/docs/tutorials/streams/)

## Stinks
No one is perfect, not even Dart. I feel the need to rant about one thing.

#### Private variables
To create a private variable in Dart you prefix it with underline, like this `var _point = new Point();`. I hate this. The name of a variable should never, ever, alter the usage of that variable. Here Dart should choose between going with Java or Python.
By going with Java they should add the `private` and `protected` modifiers. `public` is neither needed or wanted as that is the default behaviour and there should only ever be one obvious way to archive the same thing. If the instead go with Python they can keep the _ but it shouldn't behave any differently than any other name. A variable prefixed with underline is by convention private and shouldn't be tampered with, but may be as it's just a variable like any other one.

## Concluding remarks
While this hardly is even near a complete guide of what make Dart good I
think that this is a nice little collection of `"this is better than $language"` whatever language you may be using. Dart also have additional goodies like factories, this. constructor variables and much more. Read about it on [A Tour of the Dart Language](https://www.dartlang.org/docs/dart-up-and-running/contents/ch02.html). We'll see if I will continue this post later on with more specific ones about certain stuff.

Now, should everyone just throw themselves as Dart? No not at all. Dart is very new and you will encounter one or two bugs, and if you are going to use some libraries (and your are) you will encounter bugs in those too. Everything is just too new and moving too fast to not have some rough edges. But it’s shaping up very well and I recommend everyone interested in web development to keep an eye on it.
