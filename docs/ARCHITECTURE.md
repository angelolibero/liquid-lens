# Architecture

`src/LiquidLens.tsx` owns one canvas and one WebGL context per mounted lens. `src/shader.ts` is the whole picture: a single full-screen triangle, and a fragment shader that sums seven gaussian bodies into a field, cuts it at a level line to find the shape, pushes that line around with noise for the coastline, and inside the shape samples the photograph with a twelve-tap blur that is strongest at the shore. `src/knobs.ts` is the table of every number the look has, read by the renderer and by any panel. `src/presets.ts` is a list of partial tunings over it. `src/index.ts` limits the public exports.

The component's effect runs once per `src`: it compiles the program, loads the texture, and starts one animation frame loop. Everything else the props carry reaches the loop through refs written in a layout effect, so turning a knob never re-renders the canvas or rebuilds the context. The loop advances one clock for everything that moves on its own; `animate={false}` stops that clock and nothing else. The chase is real elapsed time and keeps answering the pointer.

The canvas measures its host every frame through a ResizeObserver and its own box, so a host that animates its size needs nothing from the caller. The backing store is capped at device pixel ratio 1.5, because a full-box shader with a twelve-tap blur at a phone's 3x is nine times the work for a difference nobody sees through a blur; boxes the size of an icon are exempt.

Unmounting cancels the frame, disconnects the observer, removes the window listener, clears the idle timer, and deletes the program, shaders, buffer and texture. The module is safe to import during server rendering; browser objects are read after mount.
