---
title: Isolates in Dart
---
[Isolates](https://api.dartlang.org/apidocs/channels/be/dartdoc-viewer/dart-isolate.Isolate) is a way to fire up another instance that is compleatly sepparate from the first except from message passing.

Message passing is done through [SendPort](https://api.dartlang.org/apidocs/channels/be/dartdoc-viewer/dart-isolate.SendPort) and [ReceivePort](https://api.dartlang.org/apidocs/channels/be/dartdoc-viewer/dart-isolate.ReceivePort). A SendPort can't be created separately, it have to be requested from a ReceivePort. After that, a SendPort can only pass massage to the ReceivePort that created it.

I will try to make this understandable using a simple example. The full example can be found on Github at <https://github.com/Pajn/dart_isolate_example>. In this example I will create a simple command line application that reverses the input string. The reversion is done in a separate isolate.

First, we spawn a new isolate from a separate file:
```dart
var receivePort = new ReceivePort();
var uri = new Uri.file('../lib/isolate.dart');
Isolate.spawnUri(uri, [], receivePort.sendPort);
```
First we create a ReceivePort, we'll get deaper into it later on. Then we creates a uri object that point to the file we want to launch. And lastly we spaw a new Isolate. The spawnUri method takes three arguments, the uri to the file we want to spawn, a list of cammand line arguments (in this example, none are passed) and a message to pass to the new isolate.
The message looks quite special but really is simple, it's just a object that is passed to the main function of our Isolate. In this case we pass the SendPort bound to the ReceivePort we just created, by doing this, the Isolate can pass messages to us.

The message (our SendPort object) as well as the comand line arguments are passed to the isolates main function wich look like this:
```dart
main(_, SendPort sendPort) {
    // ...
}
```
The first argument is a List of the command line arguments, as we don't care about them it's named `_` to make that clear. The second argument is our message, wich is type annotated to make it clear that we want a SendPort object.

Now may be a good time to deeper try to understand the receiveport and the SendPort. The SendPort is simple. It does only have a send method that takes a single argument, the message to send. It's used like this:
```dart
sendPort.send('Hello, World!');
```
The ReceivePort looks quite complex if we look it up but is too very simple. The reson that it have all those methods is becouse it implements a [Stream](https://api.dartlang.org/apidocs/channels/be/dartdoc-viewer/dart-async.Stream). If you know how a Stream works then great! If not, you'll only need to care about the listen method, it is how you listen to the incoming messages from the ReceivePort.
```dart
receivePort.listen((message) {
	// message is a copy of the object passed to sendPort.send
});
```

So now, our isolate has a SendPort object (which we passed to it when we spawned it) and our main script has a ReceivePort object that it created. This means that the Isolate can pass message to the main script, but not the other way around. To fix this, the Isolate need to create a ReceivePort object and pass its corresponding SendPort back to the main script.
```dart
var receivePort = new ReceivePort();
sendPort.send(receivePort.sendPort);
```
After that it just for the main script to take care of that SendPort.
```dart
SendPort sendPort;

receivePort.listen((message) {
    if (sendPort == null && message is SendPort) {
        sendPort = message;
    }
});
```
As we will pass other message than a single SendPort we check that we have not already received a SendPort and that the message actually is a SendPort.

After this we have full two-way communication between the scripts!

Before we go on an create full blown apps using this, it may be good to know that a message can't be a object of any type. The limitations are (quoted from the Dart API spec)
>The content of message can be: primitive values (null, num, bool, double, String), instances of SendPort, and lists and maps whose elements are any of these.

To create our revearsing string CLI tool, we first need to take care of the command line arguments.
```dart
main(List<String> args) {
    if (args.length < 1) {
        print ('A message to pass to the isolate is needed');
        exit(1);
    }
    var userMessage = args.join(' ');

    // ...
```
As command line arguments are separated by space and we only want one string, it's easiest to just join them with a space again.

Then, we need to pass the userMassage to the Isolate so that it can reverse it. This can only be done after we have received a SendPort from the Isolate.
```dart
receivePort.listen((message) {
    if (sendPort == null && message is SendPort) {
        sendPort = message;
        sendPort.send(userMessage)
    }
    // ...
```
This is the same as the example above except that it sends the userMessage as soon as a SendPort is received.

We also need to get the result back from the isolate
```dart
receivePort.listen((message) {
    if (sendPort == null && message is SendPort) {
        sendPort = message;
        sendPort.send(userMessage);
    } else if (message is String) {
        print(message);
        exit(0);
    }
});
```
To make sure that we don't missbehave if the Isolate does, we check that the message is a String. If so, we print it and exit.

Now our main script is done and the only thing left to do is to make sure the Isolate reverses and sends back Strings.
```dart
receivePort.listen((String message) {
    if (message is String) {
        var reversedMessage = message.split('').reversed.join('');
        sendPort.send(reversedMessage);
    }
});
```

And now we are done! We can se our simple program work
```
dart main.dart Hello, World!
!dlroW ,olleH
```

Again, see [Github](https://github.com/Pajn/dart_isolate_example) for the full source code.
