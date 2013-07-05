/*
 * Keyboard Handling
 * =================
 */

interface KeyboardHandler {
    onKeyDown: (keyCode: number) => void;
    onKeyUp: (keyCode: number) => void;
}

class KeyboardDelegate {
    private handlers: Array<KeyboardHandler> = [];

    constructor() {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.handlers.forEach((handler) => handler.onKeyDown(event.keyCode));
        });
        document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.handlers.forEach((handler) => handler.onKeyUp(event.keyCode));
        });
    }

    public addHandler(handler: KeyboardHandler) {
        this.handlers.push(handler);
    }
}


