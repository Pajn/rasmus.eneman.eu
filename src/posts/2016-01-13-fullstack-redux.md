---
title: Fullstack Redux
---
My deep dive is into Fullstack Redux.
The video is available at <https://youtu.be/L39o46cdCwI>.

[redux-websocket] is the module that handle communication between the server and the client.
Currently it only works with a single global Redux store on the server and have no authentication
support.
For persisting the state I have used [redux-persist] with [nedb-persist] as a storage engine for
the server.

[nedb-persist]: https://github.com/Pajn/nedb-persist
[redux-persist]: https://github.com/rt2zz/redux-persist
[redux-websocket]: https://github.com/Pajn/redux-websocket
