import * as Bones from '../bones'

export class MessageBuffer {
    private message_queue : string[]
    constructor (private game: Bones.Engine.Game, public max_lines: number, public max_width: number) {
        this.message_queue = []
    }
    addMessage(text: string) {
        if (this.message_queue.length == this.max_lines) {
            let dropped_text = this.message_queue.pop()
        }
        this.message_queue.unshift(text.substring(0, this.max_width-1))
        this.game.display.drawFooterPanel()
    }
    getMessages() {
        return this.message_queue
    }
}