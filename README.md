orphanage
=========

> We need to reach out to the orphaned processes of this world and show them the care, hope, and exit codes they deserve.

## purpose

Implement API very close to [`child_process`](http://nodejs.org/api/child_process.html) where (1) the child processes continue to work after the parent process goes away and (2) a new parent process can easily claim and manage orphaned child processes.

## use case

You need to restart a node process without interrupting the long-running work that it is currently doing. 

If you use orphanage to fork long-running worker processes, you can restart node and the worker processes will continue. The newly restarted node process will notice the working/completed orphaned workers from the previous node process and consume their output as if it had spanwed the processes itself.

## api

### `orphanage.open(path, [interval = 250], callback)`

This opens an orphanage on the specified directory (we use the filesystem to maintain state). The `callback` gets two arguments `(err, orphans).` `orphans` is an `EventEmitter` and has additional methods as specified below. When you can no longer care for the orphans, you should call `orphans.abandon().` 

You shouldn't run two orphanages on the same directory.

The filesystem is polled for output from orphans based on the interval in milliseconds.

### `orphans.abandon()`

This cleans up the orphans object and clears all event listeners. The `close` event is emitted once the object is cleaned up (but before clearing event listeners).

### `orphans.exec(command, inheritance, [options])`

You're making an orphan whose life purpose is to do an [`child_process.exec`](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) command. The orphan has only this command, and whatever `inheritance` you leave it. The inheritance will be present in any events resulting from this orphan in the future.

Exec method will result in a single `complete` event when the script finishes.

#### inheritance

A good inheritance should at least be a name, so that you can identify future events. Remember, your process might not be around in the future, so any details you need to properly react to `complete`, `stdout`, or `stderr` events should be stored with the inheritance. 

**Inheritance must be JSON serializable**

### `orphans.spawn(command, args, inheritance, [options])`

This mimicks the [`child_process.spawn`](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) command in an abandonable way.

Spawn will result in zero to many `stdout` and `stderr` events a single `complete` event.

### events

The orphans object will emit these events.

#### `complete: (result, inheritance)`

Complete is emitted when a spanwed or execed process completes. Result is an object containing the keys `stdout`, and `stderr` which are strings, and `code` which is an integer. Inheritance is whatever you passed to spawn or exec.

#### `stdout: (stdout, inheritance)`

Stdout is emitted when a spawned task writes to stdout, and the stdout variable is the data that the process wrote. Inheritance is whatever you passed to spawn.

#### `stderr: (stderr, inheritance)`

Stderr is emitted when a spawned task writes to stderr, and the stderr variable is the data the the process wrote. Inheritance is whatever you passed to spawn.

#### `error`

Error is emitted when something bad happens. The orphanage is in a bad state and you can't rely on it operating normaly. You don't want to see error happen. It usually means permission issues to the filesystem.

#### `close`

Close is emitted when the orphanage is done shutting down and has cleaned up resources. Listen for this after calling `abandon()`.

## license

The MIT License (MIT)

Copyright (c) 2013 MongoHQ Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.