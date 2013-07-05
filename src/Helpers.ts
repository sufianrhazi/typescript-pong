/*
 * Helper Functions 
 * ================
 *
 * ### startLoop: (loop: (timeDelta: number) => void) => void
 * 
 * Calls the `loop` function every frame with `timeDelta` equal to the number of seconds that have passed since the last frame.
 * 
 */
function startLoop(loop: (timeDelta: number) => void): void {
    var lastFrame: Date = null;

    function nextFrame() {
        var now: Date = new Date();
        var timeDelta: number;
        if (lastFrame == null) {
            timeDelta = 0;
        } else {
            timeDelta = (now.getTime() - lastFrame.getTime()) / 1000;
        }
        lastFrame = now;
        loop(timeDelta);
        requestAnimationFrame(nextFrame);
    }
    requestAnimationFrame(nextFrame);
}

/*
 * ### createDiv: (container: HTMLElement, className: string) => HTMLDivElement
 * 
 * Create a new `<div>` element that has class=`className` and is a child of `contiainer`.
 */
function createDiv(container: HTMLElement, className: string): HTMLDivElement {
    var el = document.createElement('div');
    el.className = className;
    container.appendChild(el);
    return el;
}
