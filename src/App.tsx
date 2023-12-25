import type { Component } from 'solid-js';
import styles from './App.module.css';
import Section from './Section';

const App: Component = () => {
	return (
		<div class={styles.App}>
			<Section />
			<div class={styles.showcase}>
				<div class="game-demo" id="pong"></div>
				<div class="game-demo" id="breakout"></div>
				<div class="game-demo" id="space-invaders"></div>
				<div class="game-demo" id="asteroids"></div>
			</div>
		</div>
	);
};

export default App;
