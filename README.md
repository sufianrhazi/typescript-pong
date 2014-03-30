Typescript Pong
===============

An implementation of Pong written in TypeScript. 

I've only confirmed that it works in Chrome, Firefox, and Safari. Ironically untested on IE.

Try it out here: [http://sufianrhazi.github.io/typescript-pong](http://sufianrhazi.github.io/typescript-pong)


Why?
----

I've seen lots of talk about the benefits of typescript, and not many examples of actual complete products. This project
was an exercise in learning typescript, evaluating its pros and cons, and providing a list of "gotchas" that aren't
immediately clear from the [language
specification](http://www.typescriptlang.org/Content/TypeScript%20Language%20Specification.pdf).

### Takeaways

* Non-obvious benefits of typescript:
    * Sanity while refactoring: with its strong typing, javascript actually becomes *easy* to modify.
    * Enums are great, but they really have me wanting algebraic data types.
    * Better code organization: using interfaces as much as possible leads to more decoupled OOP.
    * Constructor property assignment removes silly boilerplate
* ~~Type annotations are optional; I wish you could make them mandatory with a compiler flag.~~ Typescript 0.9.1 now has a ["no implicit any"](http://blogs.msdn.com/b/typescript/archive/2013/08/06/announcing-0-9-1.aspx) option.
* I don't have windows installed, but I had no problem writing typescript.
* Developing in vim was okay. [syntastic](https://github.com/scrooloose/syntastic) has a typescript plugin which marks
  compiler errors correctly.  There isn't anything that appears to provide auto-complete.
* ~~The default declarations for `window` and other objects are lacking; notably missing are declarations for
  vendor-specific things like `mozRequestAnimationFrame` or Web Audio `AudioContext`.~~
  [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) is really great.
* The compiler is really, really slow.


### Oddities

* *This should be more obvious*: to "include" a file from another file, you must add a triple-slash xmlish comment: `///<reference path="include_me.ts"/>`
* Compiled .js output has CRLFs
* Type annotations on function-keyword declared functions aren't consistent: `method: (fn: () => void) => void` vs `function func(fn: () => void): void { ... }` vs `var funcvar: (fn: () => void) => void;`


Dependencies
------------

* [typescript >= 0.9](http://www.typescriptlang.org/),
* [scons](http://www.scons.org/)

Run scons inside the repository, open pong.html

This repo uses git submodules, clone with `git clone --recursive` or run `git submodule update --init --recursive`.


License
-------

This is released under the [BSD-2-Clause](http://opensource.org/licenses/BSD-2-Clause) license. See the LICENSE file.
