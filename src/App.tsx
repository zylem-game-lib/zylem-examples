import type { Component } from 'solid-js';
import styles from './App.module.css';
import Section from './Section';

const App: Component = () => {
	return (
		<div class={styles.App}>
			<Section />
		</div>
	);
};

export default App;
