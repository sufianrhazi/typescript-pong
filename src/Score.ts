/*
 * class Score
 * ===========
 *
 * Holds and displays a player's score
 *
 */
class Score {
    private score: number = 0;
    constructor(
        private element: HTMLDivElement
    ) {
        this.updateElement();
    }

    public inc(): void {
        this.score += 1;
        this.updateElement();
    }

    private updateElement(): void {
        while (this.element.childNodes.length > 0) {
            this.element.removeChild(this.element.childNodes[0]);
        }
        this.element.appendChild(document.createTextNode(this.score.toString()));
    }
}

