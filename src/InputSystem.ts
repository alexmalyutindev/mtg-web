export class Vector2 {
    x : number;
    y : number;

    constructor(x : number, y : number){
        this.x = x;
        this.y = y;
    }
}

export class Input {
	static keyboard: Map<string, boolean>;
	static axis: Vector2;

	static Init(w: Window) {
		Input.keyboard = new Map<string, boolean>();
		Input.axis = new Vector2(0, 0);

		w.addEventListener("keydown", Input.keyDown.bind(this));
		w.addEventListener("keyup", Input.keyUp.bind(this));
	}

	private static keyDown(event: KeyboardEvent) {
		// console.log("[Input] Down: " + event.key);
		Input.keyboard.set(event.key, true);
		switch (event.key.toLowerCase()) {
			case 'd': Input.axis.x = 1;
				break;
			case 'a': Input.axis.x = -1;
				break;
			case 'w': Input.axis.y = 1;
				break;
			case 's': Input.axis.y = -1;
				break;
		}
	}

	private static keyUp(event: KeyboardEvent) {
		// console.log("[Input] Up: " + event.key);
		Input.keyboard.set(event.key, false);

		switch (event.key.toLowerCase()) {
			case 'd': Input.axis.x = Input.axis.x > 0 ? 0 : Input.axis.x;
				break;
			case 'a': Input.axis.x = Input.axis.x < 0 ? 0 : Input.axis.x;
				break;
			case 'w': Input.axis.y = Input.axis.y > 0 ? 0 : Input.axis.y;
				break;
			case 's': Input.axis.y = Input.axis.y < 0 ? 0 : Input.axis.y;
				break;
		}
	}
};