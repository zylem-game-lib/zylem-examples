import type { Component } from 'solid-js';
import styles from './Section.module.css';
import { ExamplesSelect } from './ExampleSelect';

const Section: Component = () => {
	return (
		<section class={styles['examples-section']}>
			<ExamplesSelect />
		</section>
	);
};

export default Section;
