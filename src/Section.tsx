import type { Component } from 'solid-js';
import styles from './Section.module.css';

const Section: Component = () => {
	return (
		<section class={styles['examples-section']}>
			<h1>Examples</h1>
			<select>
				<option value="pong">Pong</option>
				<option value="breakout">Breakout</option>
				<option value="space-invaders">Space Invaders</option>
			</select>
		</section>
	);
};

export default Section;
