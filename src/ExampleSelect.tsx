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
				const game = await import('./examples/pong/pong');
				game.default.start();
			},
		},
		{
			label: 'Breakout',
			value: 'breakout',
			action: async () => {
				const game = await import('./examples/breakout/breakout');
				game.default.start();
			},
		},
		{
			label: 'Space Invaders',
			value: 'space-invaders',
			action: async () => {
				const game = await import(
					'./examples/space-invaders/space-invaders'
				);
				game.default.start();
			},
		},
		{
			label: 'Asteroids',
			value: 'asteroids',
			action: async () => {
				const game = await import('./examples/asteroids/asteroids');
				game.default.start();
			},
		},
		{
			label: '2.5D Platformer',
			value: 'platformer',
			action: async () => {
				const game = await import('./examples/platformer/platformer');
				game.default.start();
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
