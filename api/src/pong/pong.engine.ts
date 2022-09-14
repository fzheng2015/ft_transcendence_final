export enum GameMode {
	NORMAL,
	EASY,
	HARDCORE,
	DUAL
}

export class PongEngine {

	// IMPORTANT : THIS MUST BE MATCHED WITH WHAT IS ON THE CLIENT !
	mode = GameMode.NORMAL
	serverState = {
		paddle_height: 50,
		paddle_half_height: 25, // Update this too !
		paddle_width: 10,
		paddle1_pos_x: 40,
		paddle2_pos_x: 600,
		paddle_speed: 6,
		board_width: 640,
		board_height: 480,
		ball_speed: 6,
		ball_velocity_x: 0,
		ball_velocity_y: 0,
		ball2_velocity_x: 0,
		ball2_velocity_y: 0,
		ball1_active: true,
		ball2_active: false,
		ball_width: 10
	}

	maxBounceAngle = 6 * Math.PI / 12; // 75 degrees, it's in radian

	// eventually we will need one of these for each game
	sharedState = {
		ball_pos_x: this.serverState.board_width / 2,
		ball_pos_y: this.serverState.board_height / 2,
		ball2_pos_x: this.serverState.board_width / 2,
		ball2_pos_y: this.serverState.board_height / 2,
		paddle1_pos_y: this.serverState.board_height / 2,
		paddle2_pos_y: this.serverState.board_height / 2,
		paddle1_score: 0,
		paddle2_score: 0,
	}

	constructor(mode: GameMode) {
		this.mode = mode;
		// IMPORTANT : THIS MUST BE MATCHED WITH WHAT IS ON THE CLIENT !

		if (mode === GameMode.NORMAL) {
			this.serverState.paddle_height = 50;
			this.serverState.paddle_half_height = 25;
			this.serverState.ball_width = 10;
			this.serverState.ball2_active = false;
			this.serverState.ball_speed = 6;
		} else if (mode === GameMode.EASY) {
			this.serverState.paddle_height = 80;
			this.serverState.paddle_half_height = 40;
			this.serverState.ball_width = 20;
			this.serverState.ball2_active = false;
			this.serverState.ball_speed = 6;
		} else if (mode === GameMode.HARDCORE) {
			this.serverState.paddle_height = 30;
			this.serverState.paddle_half_height = 15;
			this.serverState.ball_width = 10;
			this.serverState.ball2_active = false;
			this.serverState.ball_speed = 8;
		} else if (mode === GameMode.DUAL) {
			this.serverState.paddle_height = 50;
			this.serverState.paddle_half_height = 25;
			this.serverState.ball_width = 10;
			this.serverState.ball2_active = true;
			this.serverState.ball_speed = 6;
		}
	}

	update() {
		this.sharedState.ball_pos_x += this.serverState.ball_velocity_x;
		this.sharedState.ball_pos_y += this.serverState.ball_velocity_y;
		[this.sharedState.ball_pos_x, this.sharedState.ball_pos_y,
		this.serverState.ball_velocity_x, this.serverState.ball_velocity_y] = this.applyPaddleCollision(
			this.sharedState.ball_pos_x, this.sharedState.ball_pos_y,
			this.serverState.ball_velocity_x, this.serverState.ball_velocity_y);
		this.applyWallCollision_y_withBall1();
		this.applyWallCollision_x_withBall1();
		if (this.mode === GameMode.DUAL) {
			this.sharedState.ball2_pos_x += this.serverState.ball2_velocity_x;
			this.sharedState.ball2_pos_y += this.serverState.ball2_velocity_y;
			[this.sharedState.ball2_pos_x, this.sharedState.ball2_pos_y,
			this.serverState.ball2_velocity_x, this.serverState.ball2_velocity_y] = this.applyPaddleCollision(
				this.sharedState.ball2_pos_x, this.sharedState.ball2_pos_y,
				this.serverState.ball2_velocity_x, this.serverState.ball2_velocity_y);
			this.applyWallCollision_y_withBall2();
			this.applyWallCollision_x_withBall2();
		}
		if (!this.serverState.ball1_active && !this.serverState.ball2_active) {
			this.reset();
		}
	}

	getSharedState() {
		return this.sharedState;
	}

	reset() {
		this.sharedState.ball_pos_x = this.serverState.board_width / 2;
		this.sharedState.ball_pos_y = this.serverState.board_height / 2;
		this.serverState.ball_velocity_x = (Math.random() < 0.5 ? -this.serverState.ball_speed / 2 : this.serverState.ball_speed / 2);
		this.serverState.ball_velocity_y = Math.floor((Math.random() - 0.5) * (this.serverState.ball_speed / 2)); // random y
		if (this.mode === GameMode.DUAL) {
			this.sharedState.ball2_pos_x = this.serverState.board_width / 2;
			this.sharedState.ball2_pos_y = this.serverState.board_height / 2;
			this.serverState.ball2_velocity_x = -this.serverState.ball_velocity_x;
			this.serverState.ball2_velocity_y = this.serverState.ball_velocity_y;

		}
		this.sharedState.paddle1_pos_y = this.serverState.board_height / 2;
		this.sharedState.paddle2_pos_y = this.serverState.board_height / 2;
		this.serverState.ball1_active = true;
		if (this.mode === GameMode.DUAL) { this.serverState.ball2_active = true; }
	}

	receiveMovement(direction: string, playerNumber: number) {
		if (playerNumber === 1) {
			switch (direction) {
				case "up":
					this.sharedState.paddle1_pos_y -= this.serverState.paddle_speed;
					this.sharedState.paddle1_pos_y = Math.max(this.sharedState.paddle1_pos_y, 20 + this.serverState.paddle_half_height);
					break;
				case "down":
					this.sharedState.paddle1_pos_y += this.serverState.paddle_speed;
					this.sharedState.paddle1_pos_y = Math.min(this.sharedState.paddle1_pos_y, this.serverState.board_height - 20 - this.serverState.paddle_half_height);
					break;
			}
		} else {
			switch (direction) {
				case "up":
					this.sharedState.paddle2_pos_y -= this.serverState.paddle_speed;
					this.sharedState.paddle2_pos_y = Math.max(this.sharedState.paddle2_pos_y, 20 + this.serverState.paddle_half_height);
					break;
				case "down":
					this.sharedState.paddle2_pos_y += this.serverState.paddle_speed;
					this.sharedState.paddle2_pos_y = Math.min(this.sharedState.paddle2_pos_y, this.serverState.board_height - 20 - this.serverState.paddle_half_height);
					break;
			}
		}
	}

	private applyPaddleCollision(ball_pos_x: number, ball_pos_y: number, ball_velocity_x: number, ball_velocity_y: number) {
		let ball_left = ball_pos_x - this.serverState.ball_width / 2;
		let ball_right = ball_pos_x + this.serverState.ball_width / 2;
		let ball_down = ball_pos_y + this.serverState.ball_width / 2
		let ball_up = ball_pos_y - this.serverState.ball_width / 2;

		// Paddle 1
		if (ball_left <= this.serverState.paddle1_pos_x + this.serverState.paddle_width / 2
			&& ball_right >= this.serverState.paddle1_pos_x - this.serverState.paddle_width / 2) {
			if (this.sharedState.paddle1_pos_y - this.serverState.paddle_half_height <= ball_down
				&& ball_up <= this.sharedState.paddle1_pos_y + this.serverState.paddle_half_height) {
				let normalRelativeIntersect = (this.sharedState.paddle1_pos_y - ball_pos_y) / this.serverState.paddle_half_height;
				let bounceAngle = normalRelativeIntersect * this.maxBounceAngle;
				ball_velocity_x = this.serverState.ball_speed;
				ball_velocity_y = this.serverState.ball_speed * -Math.sin(bounceAngle);
				ball_pos_x = this.serverState.paddle1_pos_x + this.serverState.paddle_width / 2 + this.serverState.ball_width / 2;
			}
		}
		// Paddle 2
		else if (ball_right >= this.serverState.paddle2_pos_x - this.serverState.paddle_width / 2
			&& ball_left <= this.serverState.paddle2_pos_x + this.serverState.paddle_width / 2) {
			if (ball_down >= this.sharedState.paddle2_pos_y - this.serverState.paddle_half_height
				&& ball_up <= this.sharedState.paddle2_pos_y + this.serverState.paddle_half_height) {
				let normalRelativeIntersect = (this.sharedState.paddle2_pos_y - ball_pos_y) / this.serverState.paddle_half_height;
				let bounceAngle = normalRelativeIntersect * this.maxBounceAngle;
				ball_velocity_x = -this.serverState.ball_speed;
				ball_velocity_y = this.serverState.ball_speed * -Math.sin(bounceAngle);
				ball_pos_x = this.serverState.paddle2_pos_x - this.serverState.paddle_width / 2 - this.serverState.ball_width / 2;
			}
		}
		return [ball_pos_x, ball_pos_y, ball_velocity_x, ball_velocity_y]
	}

	private applyWallCollision_x_withBall1() {
		if (this.serverState.ball1_active) {
			if (this.sharedState.ball_pos_x <= 10) {
				this.sharedState.paddle2_score++;
				this.serverState.ball1_active = false;
			} else if (this.sharedState.ball_pos_x >= this.serverState.board_width - 10) {
				this.sharedState.paddle1_score++;
				this.serverState.ball1_active = false;
			}
		}
	}

	private applyWallCollision_x_withBall2() {
		if (this.serverState.ball2_active) {
			if (this.sharedState.ball2_pos_x <= 0) {
				this.sharedState.paddle2_score++;
				this.serverState.ball2_active = false;
			} else if (this.sharedState.ball2_pos_x >= this.serverState.board_width) {
				this.sharedState.paddle1_score++;
				this.serverState.ball2_active = false;
			}
		}
	}

	private applyWallCollision_y_withBall1() {
		if (this.sharedState.ball_pos_y - this.serverState.ball_width / 2 <= 10) {
			this.serverState.ball_velocity_y = Math.abs(this.serverState.ball_velocity_y);
			this.sharedState.ball_pos_y = 10 + this.serverState.ball_width / 2;
		} else if (this.sharedState.ball_pos_y + this.serverState.ball_width / 2 >= this.serverState.board_height - 10) {
			this.serverState.ball_velocity_y = -Math.abs(this.serverState.ball_velocity_y);
			this.sharedState.ball_pos_y = this.serverState.board_height - 10 - this.serverState.ball_width / 2;
		}
	}

	private applyWallCollision_y_withBall2() {
		if (this.sharedState.ball2_pos_y - this.serverState.ball_width / 2 <= 10) {
			this.serverState.ball2_velocity_y = Math.abs(this.serverState.ball2_velocity_y);
			this.sharedState.ball2_pos_y = 10 + this.serverState.ball_width / 2;
		} else if (this.sharedState.ball2_pos_y + this.serverState.ball_width / 2 >= this.serverState.board_height - 10) {
			this.serverState.ball2_velocity_y = -Math.abs(this.serverState.ball2_velocity_y);
			this.sharedState.ball2_pos_y = this.serverState.board_height - 10 - this.serverState.ball_width / 2;
		}
	}

}