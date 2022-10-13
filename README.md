# Babylon.js, vite and es6 modules

A Babylon.js sample project using typescript, latest babylon.js es6 core module, vite.

Inspired by [babylonjs-webpack-es6](https://github.com/RaananW/babylonjs-webpack-es6)

## Before getting started

This is a basic demo using Babylon's core module only. It is based on the [Getting started guide](https://doc.babylonjs.com/) at the documentation page. A lot of the engine's features are **not** covered here. I will slowly add more and more projects and more examples.

If you have any questions, you are very much invited to the [Babylon.js forum](https://forum.babylonjs.com) where I am hanging around almost daily.

## Getting started

To run the basic scene:

1. Clone / download this repository
2. run `npm install` to install the needed dependencies.
3. run `npm run dev`
4. open `http://127.0.0.1:5173/`

Running `npm start` will start the vite dev server with hot-reloading turned on. Open your favorite editor (mine is VSCode, but you can use nano. we don't discriminate) and start editing.

The entry point for the entire TypeScript application is `./src/index.ts`. Any other file imported in this file will be included in the build.

To debug, open the browser's dev tool. Source maps are ready to be used. In case you are using VSCode, simply run the default debugger task (`Launch Chrome against localhost`) while making sure `npm start` is still running. This will allow you to debug your application straight in your editor.

## Loading different examples

The `./src/scenes` directory contains a few examples of scenes that can be loaded. To load a specific scene, add a `?scene=FILENAME` to the URL (i.e. to load the ammo physics demo, use `http://http://127.0.0.1:5173/?scene=physicsWithAmmo`).

More and more scenes will be slowly added.

## WebGPU? yes please!

Open the URL in a webgpu-enabled browser and add "?engine=webgpu" to the URL. If you want to add a different scene, add it as a query parameter: `http://127.0.0.1:5173/?scene=physicsWithAmmo&engine=webgpu`.
