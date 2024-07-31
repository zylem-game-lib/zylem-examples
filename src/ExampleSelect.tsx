import {
	Box,
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from '@suid/material';
import { SelectChangeEvent } from '@suid/material/Select';
import { createSignal } from 'solid-js';
import styles from './ExampleSelect.module.css';

type Item = { label: string; value: string; action: Function };

export function ExamplesSelect() {
	const [inGame, setInGame] = createSignal(false);
	const [item, setItem] = createSignal('');
	const items: Item[] = [
		{
			label: 'Pong',
			value: 'pong',
			action: async () => {
				await import('./examples/pong/pong');
			},
		},
		{
			label: 'Breakout',
			value: 'breakout',
			action: async () => {
				await import('./examples/breakout/breakout');
			},
		},
		{
			label: 'Space Invaders',
			value: 'space-invaders',
			action: async () => {
				await import('./examples/space-invaders/space-invaders');
			},
		},
		{
			label: 'Asteroids',
			value: 'asteroids',
			action: async () => {
				await import('./examples/asteroids/asteroids');
			},
		},
		{
			label: '2.5D Platformer',
			value: 'platformer',
			action: async () => {
				await import('./examples/platformer/platformer');
			},
		},
		{
			label: '3D Test',
			value: 'playground',
			action: async () => {
				await import('./examples/playground/index');
			},
		},
		{
			label: 'Shader Test',
			value: 'shader',
			action: async () => {
				await import('./examples/playground/shader');
			},
		},
	];

	const handleChange = (event: SelectChangeEvent) => {
		setItem(event.target.value);
		const item = items.find((item) => item.value === event.target.value);
		item?.action();
		setInGame(true);
	};

	return (
		<Box sx={{ minWidth: 120 }} class={styles.wrapper}>
			<FormControl fullWidth>
				<InputLabel id="select-demo-label">Examples</InputLabel>
				<Select
					labelId="select-demo-label"
					id="select-demo"
					value={item()}
					label="Examples"
					onChange={handleChange}
					disabled={inGame()}
				>
					{items.map((item) => {
						const { value, label } = item;
						return <MenuItem value={value}>{label}</MenuItem>;
					})}
				</Select>
			</FormControl>
			<Button
				variant="contained"
				disabled={!inGame()}
				onClick={() => {
					window.location.reload();
				}}
			>
				Reset
			</Button>
		</Box>
	);
}
