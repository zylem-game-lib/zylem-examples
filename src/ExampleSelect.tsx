import { Box, FormControl, InputLabel, MenuItem, Select } from '@suid/material';
import { SelectChangeEvent } from '@suid/material/Select';
import { createSignal } from 'solid-js';

type Item = { label: string; value: string; action: Function };

export function ExamplesSelect() {
	const [item, setItem] = createSignal('');
	const items: Item[] = [
		{
			label: 'Pong',
			value: 'pong',
			action: () => {
				const pong = import('./examples/pong/pong');
				pong.then((pong) => {
					pong.default.start();
				});
			},
		},
		{
			label: 'Breakout',
			value: 'breakout',
			action: () => {
				const breakout = import('./examples/breakout/breakout');
				breakout.then((breakout) => {
					breakout.default.start();
				});
			},
		},
		{
			label: 'Space Invaders',
			value: 'space-invaders',
			action: () => {
				const invaders = import(
					'./examples/space-invaders/space-invaders'
				);
				invaders.then((invaders) => {
					invaders.default.start();
				});
			},
		},
	];

	const handleChange = (event: SelectChangeEvent) => {
		setItem(event.target.value);
		const item = items.find((item) => item.value === event.target.value);
		item?.action();
	};

	return (
		<Box sx={{ minWidth: 120 }}>
			<FormControl fullWidth>
				<InputLabel id="select-demo-label">Examples</InputLabel>
				<Select
					labelId="select-demo-label"
					id="select-demo"
					value={item()}
					label="Examples"
					onChange={handleChange}
				>
					{items.map((item) => {
						const { value, label } = item;
						return <MenuItem value={value}>{label}</MenuItem>;
					})}
				</Select>
			</FormControl>
		</Box>
	);
}
