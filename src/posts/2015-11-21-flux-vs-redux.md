---
title: Flux vs Redux
---
As I have used Flux previously and the course required Redux I have spent quite a lot of time comparing them and trying to understand to pros and cons between them. If you don't stare at terminology or details they are pretty similar. A Redux store is like a Flux dispatcher and a Redux Reducer is like a Flux store. What seams like the biggest difference is that the state is stored in the dispatcher, or store rather than the stores, or reducers. This means that the data is only stored at a single place instead of multiple places.

#### So what does having data at a single place give us?
From what I can see so far, not so much. We usually never operate on all data at the same time. Sure if we want to persist the state it can be helpful but my guess is that you don't want to persist all of the state anyway, just key parts of it.

#### So what makes Redux interesting?
My answer to that is that reducers have a simple and well defined API that gives an outsider full control over the data it produces.
A reducer is just a function that takes the current state and the dispatched action and then returns the updated state. It never stores data or have any other side effects, and that makes them very composable. If you for example want undo/redo support you can use an [existing library](https://github.com/omnidan/redux-undo) or write your own in a few lines

```javascript
export function undoable(reducer) {
  return (state, action) => {
    switch (action.type) {
      case 'undo':
        if (state.past.length < 1) return state;

        return {
          past: state.past.slice(1),
          present: state.past[0],
          future: [state.present, ...state.future],
        };

      case 'redo':
        if (state.future.length < 1) return state;

        return {
          past: [state.present, ...state.past],
          present: state.future[0],
          future: state.future.slice(1),
        };

      default:
        if (!state) return {
          past: [],
          present: reducer(state, action),
          future: [],
        };

        return {
          past: [state.present, ...state.past],
          present: reducer(state.present, action),
          future: state.future,
        };
    }
  };
}
```
See how easy it was to create a higher-order reducer, a reducer that uses another reducer to do it's job. The above code have no expectations on the inner reducer other than that if follows the Redux reducer API, which means that it can be used with any reducer ever written for Redux.
This is can be quite powerful and is where Redux trumps over Flux. In Flux a store have no other public API other than reading its data. If you want to add some functionality to it, for example undo/redo, you'll have to modify the store itself.

#### So what are the downsides?
Actually, I'm not sure.
Redux first felt a bit limited to me as it is strict about actions being for modifying state, where Flux can be used as a generic message bus that passes actions which fires of calculations or what not. However I'm starting to think that that is a good thing, if you want a generic message bus there are other technologies for that.

Another pain point for me were that I lost a lot of type info in Typescript, however by creating [helper functions](https://github.com/Pajn/anterminal/blob/master/app/lib/redux/helpers.ts) that wraps Redux I was able to create an API where types could be flowed so I get full type info without having to specify the type on more than one place.

Flux and Redux implements the same patterns but in slightly different ways so it may actually be so that there is no mentionable downsides. Redux just made the store logic composable.

So it seems that David has won me over to the Redux side :)
