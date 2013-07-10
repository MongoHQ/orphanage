orphanage
=========

> We, who have so much, need to reach out to the orphaned processes of this world and show them the care, hope, and love they deserve.

## purpose

Implement something very close to [`child_process`](http://nodejs.org/api/child_process.html) which leads an industrius life even after the parent process dies. The child's output and toils can be picked up by new loving parents.

## use case

You need to restart a node process without interrupting the long-running work that it is currently doing. 

If you use orphanage to do the long-running worker process, you can restart node and the worker process will continue. The newly restarted node process will notice the working/completed orphaned worker from the previous node process and consume its output as if it had spanwed the process itself.

## api

### `orphanage.open(path, callback)`

This opens an orphanage on the specified directory (we use the filesystem to maintain state). The `callback` gets two arguments `(err, orphans).` `orphans` is an `EventEmitter` and has additional methods as specified below. When you can no longer care for the orphans, you should call `orphans.abandon()` so that another orphanage can handle their output.

### `orphans.abandon()`

This cleans up the orphans object and clears all event listeners. If an error occurs while doing this operation, and `error` event is emitted before clearing all event listeners.

### `orphans.exec(command, inheritance, [options])`

You're making an orphan whose life purpose is to do an [`child_process.exec`](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) command. The orphan has only this command, and whatever `inheritance` you leave it which will be present in any events resulting from this orphan in the future.

Exec method will result in a single `complete` event when the script finishes.

#### inheritance

A good inheritance should at least be a name, so that you can identify future events. Remember, your process might not be around in the future, so any details you need to properly react to `complete`, `stdout`, or `stderr` events should be stored with the inheritance. Inheritance must be able to be marshalled into JSON.

### `orphans.spawn(command, args, inheritance, [options])`

Much like spawn, this mimicks the [`child_process.spawn`](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) command.

Spawn will result in zero to many `stdout` and `stderr` messages a single `complete` event.
