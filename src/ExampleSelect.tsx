import { Select } from '@ark-ui/solid';
import { Index, Portal } from 'solid-js/web';
import { IoChevronDownSharp } from 'solid-icons/io';
import styles from './ExampleSelect.module.css';
import { createSignal } from 'solid-js';

type Item = { label: string; value: string; action: Function };

export const ExamplesSelect = () => {
	const [inGame, setInGame] = createSignal(false);
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
	return (
		<Select.Root
			class={inGame() ? styles['select-disabled'] : styles.select}
			items={items}
			onValueChange={(e) => {
				setInGame(true);
				const { items } = e;
				items[0].action();
			}}
		>
			<Select.Label>Examples</Select.Label>
			<Select.Control class={styles['select-dropdown']}>
				<Select.Trigger class={styles['select-dropdown']}>
					<Select.ValueText placeholder="Select an example" />
					<Select.Indicator>
						<IoChevronDownSharp />
					</Select.Indicator>
				</Select.Trigger>
				<Select.ClearTrigger>x</Select.ClearTrigger>
			</Select.Control>
			<Portal>
				<Select.Positioner>
					<Select.Content>
						<Select.ItemGroup id="example">
							<Select.ItemGroupLabel for="example">
								Examples
							</Select.ItemGroupLabel>
							<Index each={items}>
								{(item) => (
									<Select.Item item={item().value}>
										<Select.ItemText>
											{item().label}
										</Select.ItemText>
										<Select.ItemIndicator>
											✓
										</Select.ItemIndicator>
									</Select.Item>
								)}
							</Index>
						</Select.ItemGroup>
					</Select.Content>
				</Select.Positioner>
			</Portal>
		</Select.Root>
	);
};
