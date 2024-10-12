import { clamp } from "../libs/utils";
import { If, StaticFor } from "../pozitron-web";

const Boosts = {
	Move: [
		// yellow
		{tier: 'T1', title: 'ZO', tooltip: '2x Move speed', color: 'mineral-z'},
		{tier: 'T2', title: 'ZHO2', tooltip: '3x Move speed', color: 'mineral-z'},
		{tier: 'T3', title: 'XZHO2', tooltip: '4x Move speed', color: 'mineral-z'},
	],
	Work: [
		// harvest: teal
		{tier: 'T1', title: 'UO', tooltip: '3x Harvest', color: 'mineral-u'},
		{tier: 'T2', title: 'UHO2', tooltip: '5x Harvest', color: 'mineral-u'},
		{tier: 'T3', title: 'XUHO2', tooltip: '7x Harvest', color: 'mineral-u'},

		// upgrade: white
		{tier: 'T1', title: 'GH', tooltip: '1.5x Upgrade', color: 'mineral-g'},
		{tier: 'T2', title: 'GH2O', tooltip: '1.8x Upgrade', color: 'mineral-g'},
		{tier: 'T3', title: 'XGH2O', tooltip: '2x Upgrade', color: 'mineral-g'},

		// build/repair: green
		{tier: 'T1', title: 'LH', tooltip: '1.5x Build/Repair', color: 'mineral-l'},
		{tier: 'T2', title: 'LH2O', tooltip: '1.8x Build/Repair', color: 'mineral-l'},
		{tier: 'T3', title: 'XLH2O', tooltip: '2x Build/Repair', color: 'mineral-l'},

		// dismantle: yellow
		{tier: 'T1', title: 'ZH', tooltip: '2x Dismantle', color: 'mineral-z'},
		{tier: 'T2', title: 'ZH2O', tooltip: '3x Dismantle', color: 'mineral-z'},
		{tier: 'T3', title: 'XZH2O', tooltip: '4x Dismantle', color: 'mineral-z'},
	],
	Carry: [
		// violet
		{tier: 'T1', title: 'KH', tooltip: '2x Capacity', color: 'mineral-k'},
		{tier: 'T2', title: 'KH2O', tooltip: '3x Capacity', color: 'mineral-k'},
		{tier: 'T3', title: 'XKH2O', tooltip: '4x Capacity', color: 'mineral-k'},
	],
	Attack: [
		// teal
		{tier: 'T1', title: 'UH', tooltip: '2x Melee damage', color: 'mineral-u'},
		{tier: 'T2', title: 'UH2O', tooltip: '3x Melee damage', color: 'mineral-u'},
		{tier: 'T3', title: 'XUH2O', tooltip: '4x Melee damage', color: 'mineral-u'},
	],
	Ranged: [
		// violet
		{tier: 'T1', title: 'KO', tooltip: '2x Ranged damage', color: 'mineral-k'},
		{tier: 'T2', title: 'KHO2', tooltip: '3x Ranged damage', color: 'mineral-k'},
		{tier: 'T3', title: 'XKHO2', tooltip: '4x Ranged damage', color: 'mineral-k'},
	],
	Heal: [
		// green
		{tier: 'T1', title: 'LO', tooltip: '2x Heal', color: 'mineral-l'},
		{tier: 'T2', title: 'LHO2', tooltip: '3x Heal', color: 'mineral-l'},
		{tier: 'T3', title: 'XLHO2', tooltip: '4x Heal', color: 'mineral-l'},
	],
	Tough: [
		// white
		{tier: 'T1', title: 'GO', tooltip: '30% Damage reduction', color: 'mineral-g'},
		{tier: 'T2', title: 'GHO2', tooltip: '50% Damage reduction', color: 'mineral-g'},
		{tier: 'T3', title: 'XGHO2', tooltip: '70% Damage reduction', color: 'mineral-g'},
	],
};

const BoostColors = {};
const BoostTiers = {};
const BoostTolltips = {};
for (const partType in Boosts) {
	for (const boost of Boosts[partType]) {
		BoostColors[boost.title] = boost.color;
		BoostTiers[boost.title] = boost.tier;
		BoostTolltips[boost.title] = boost.tooltip;
	}
}

function BodyPartCompose(props) {
	const { label, data, tooltip } = props;
	const partType = props.label.toLowerCase();

	const boosts = Boosts[label];

	function increaseCount(e) {
		const inc = e.shiftKey ? 5 : 1;
		data.count = clamp(data.count + inc, 0, 50);
	}

	function decreaseCount(e) {
		const inc = e.shiftKey ? 5 : 1;
		data.count = clamp(data.count - inc, 0, 50);
	}

	let dropdownEl;

	function handleButtonBoostClick(e) {
		const buttonEl = e.target.closest('button');
		const isOpen = buttonEl.classList.toggle('dropdown-open');
		if (isOpen) {
			return;
		}
		const itemEl = e.target.closest('.dropdown-item');
		if (itemEl) {
			const boost = itemEl.querySelector('.dropdown-item-boost').textContent;
			data.boost = (boost !== 'none') ? boost : '';
		}
	}

	function handleButtonBoostFocusOut(e) {
		const buttonEl = e.target;
		if (buttonEl.classList.contains('dropdown-open')) {
			setTimeout(() => {
				if (document.activeElement.closest('.btn-body-compose-boost') !== buttonEl) {
					buttonEl.classList.remove('dropdown-open');
				}
			}, 0);
		}
	}

	function getBoostColor(boost) {
		const color = BoostColors[boost];
		if (color) {
			return `var(--cl-${color})`;
		}
	}

	return (
		<div
			class="body-compose-part"
			style={`--cl-part: var(--cl-part-${partType})`}
			classList={{
				'part-has-boost': () => (data.boost !== ''),
				'part-has-count': () => data.count > 0
			}}
		>
			<If condition={boosts}>{[
				() => (
					<button
						class="btn-body-compose-boost"
						title={() => BoostTolltips[data.boost] || undefined}
						onClick={handleButtonBoostClick}
						onFocusOut={handleButtonBoostFocusOut}
					>
						<If condition={() => data.boost}>{[
							() => <span>{() => BoostTiers[data.boost]}</span>,
							() => <span><i class="mdi mdi-chevron-down"></i></span>
						]}</If>
						<span
							class="boost-type"
							style={{
								'--cl-boost': () => getBoostColor(data.boost)
							}}
						>{() => data.boost || 'boost'}</span>
						<div class="dropdown" title="" ref={dropdownEl}>
							<div class="dropdown-item">
								<span style="display: inline-block;width: 20px;opacity: 0.4;">--</span>
								<span class="dropdown-item-boost">none</span>
							</div>
							<StaticFor each={boosts}>{ boost => (
								<div class="dropdown-item" title={boost.tooltip}>
									<span style="display: inline-block;width: 20px;">{boost.tier}</span>
									<span class="dropdown-item-boost">{boost.title}</span>
								</div>
							)}</StaticFor>
						</div>
					</button>
				),
				() => <div style="width: 100px"></div>
			]}</If>
			
			<div class="body-compose-part-title" title={tooltip}>
				<span>{label}</span>
				<div class="body-compose-part-count">{() => data.count}</div>
			</div>
			<button
				class="btn-body-compose" title="Increase parts count"
				onClick={increaseCount} onMouseDown={e => e.preventDefault()}
			><i class="mdi mdi-plus" /></button>
			<button
				class="btn-body-compose" title="Decrease parts count"
				onClick={decreaseCount} onMouseDown={e => e.preventDefault()}
			><i class="mdi mdi-minus" /></button>
		</div>
	);
}

function PanelBodyComposeParts({ bodyParts, clear }) {
	return (
		<div id="panel-body-compose-parts">
			<div style="margin-bottom: -45px;">
				<button
					class="btn-body-parts-clear"
					onClick={clear} onMouseDown={e => e.preventDefault()}
				>Clear</button>
			</div>
			<BodyPartCompose label="Move" tooltip="Move - 50 EN" data={bodyParts.Move} />
			<BodyPartCompose label="Work" tooltip="Work - 100 EN" data={bodyParts.Work} />
			<BodyPartCompose label="Carry" tooltip="Carry - 50 EN" data={bodyParts.Carry} />
			<BodyPartCompose label="Attack" tooltip="Attack - 80 EN" data={bodyParts.Attack} />
			<BodyPartCompose label="Ranged" tooltip="Ranged Attack - 150 EN" data={bodyParts.Ranged} />
			<BodyPartCompose label="Heal" tooltip="Heal - 250 EN" data={bodyParts.Heal} />
			<BodyPartCompose label="Tough" tooltip="Tough - 10 EN" data={bodyParts.Tough} />
			<BodyPartCompose label="Claim" tooltip="Claim - 600 EN" data={bodyParts.Claim} />
			<div class="body-compose-hint">
				<span class="body-compose-hint-sign">±</span>
				<span style="margin-right: 15px">5</span>Shift + <i class="mdi mdi-mouse" style="opacity: 0.5;" />
				<span class="body-compose-hint-mouse-overlay">
					<i class="mdi mdi-mouse" />
				</span>
			</div>
		</div>
	);
}

export default PanelBodyComposeParts;