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

function loadGame(game: string) {
	return async function () {
		const gameModule = await import(`./examples/${game}/${game}`);
		await gameModule.default.start();
	};
}

export function ExamplesSelect() {
	const [inGame, setInGame] = createSignal(false);
	const [item, setItem] = createSignal('');
	const items: Item[] = [
		{
			label: 'Pong',
			value: 'pong',
			action: loadGame('pong'),
		},
		{
			label: 'Breakout',
			value: 'breakout',
			action: loadGame('breakout'),
		},
		{
			label: 'Space Invaders',
			value: 'space-invaders',
			action: loadGame('space-invaders'),
		},
		{
			label: 'Asteroids',
			value: 'asteroids',
			action: loadGame('asteroids'),
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
