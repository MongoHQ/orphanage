orphanage
=========

> We, who have so much, need to reach out to the orphaned processes of this world and show them the care, hope, and love they deserve.

## purpose

Implement something very close to [`child_process`](http://nodejs.org/api/child_process.html) that lives on after the parent process dies, and can be picked up by another process.

## use case

You need to restart a node process without interrupting the long-running work that it is currently doing. 

If you use orphanage to do the long-running worker process, you can restart node and the worker process will continue. The newly restarted node process will notice the working/completed orphaned worker from the previous node process and consume its output as if it had spanwed the process itself.

## api

### `orphanage.open(path, callback)`

This opens an orphanage on the specified directory. The `callback` gets two arguments `(err, orphans)`. `orphans` is an `EventEmitter` and has additional methods as specified below. When you can no longer care for the orphans, you should call `orphans.abandon()` so that another orphanage can handle their output.

### `orphans.abandon()`

This cleans up the orphans object and clears all event listeners. If an error occurs while doing this operation, and `error` event is emitted before clearing all event listeners.

### `orphans.exec(command, [options])`

This tasks a poor orphan to fulfil your command. Since this is an orphan, you may not always be around to receive the callback, and you should handle getting the output from an event instead.
