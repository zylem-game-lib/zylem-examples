import type { Component } from 'solid-js';

import styles from './App.module.css';
import Section from './Section';
import game from './examples/pong/pong';
game.start();

const App: Component = () => {
	return (
		<div class={styles.App}>
			<Section />
			<main id="pong" />
		</div>
	);
};

export default App;
