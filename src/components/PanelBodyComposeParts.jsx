import { clamp } from "../libs/utils";
import { If, StaticFor } from "../pozitron-web";

const Boosts = {
	Move: [
		// yellow
		{tier: 'T3', title: 'ZO', color: 'mineral-z'},
		{tier: 'T2', title: 'ZHO2', color: 'mineral-z'},
		{tier: 'T1', title: 'XZHO2', color: 'mineral-z'},
	],
	Work: [
		// harvest: teal
		{tier: 'T3', title: 'UO', color: 'mineral-u'},
		{tier: 'T2', title: 'UH2O', color: 'mineral-u'},
		{tier: 'T1', title: 'XUH2O', color: 'mineral-u'},

		// upgrade: white
		{tier: 'T3', title: 'GH', color: 'mineral-g'},
		{tier: 'T2', title: 'GH2O', color: 'mineral-g'},
		{tier: 'T1', title: 'XGH2O', color: 'mineral-g'},

		// build/repair: green
		{tier: 'T3', title: 'LH', color: 'mineral-l'},
		{tier: 'T2', title: 'LH2O', color: 'mineral-l'},
		{tier: 'T1', title: 'XLH2O', color: 'mineral-l'},

		// dismantle: yellow
		{tier: 'T3', title: 'ZH', color: 'mineral-z'},
		{tier: 'T2', title: 'ZH2O', color: 'mineral-z'},
		{tier: 'T1', title: 'XZH2O', color: 'mineral-z'},
	],
	Carry: [
		// violet
		{tier: 'T3', title: 'KH', color: 'mineral-k'},
		{tier: 'T2', title: 'KH2O', color: 'mineral-k'},
		{tier: 'T1', title: 'XKH2O', color: 'mineral-k'},
	],
	Attack: [
		// teal
		{tier: 'T3', title: 'UH', color: 'mineral-u'},
		{tier: 'T2', title: 'UH2O', color: 'mineral-u'},
		{tier: 'T1', title: 'XUH2O', color: 'mineral-u'},
	],
	Ranged: [
		// violet
		{tier: 'T3', title: 'KH', color: 'mineral-k'},
		{tier: 'T2', title: 'KHO2', color: 'mineral-k'},
		{tier: 'T1', title: 'XKHO2', color: 'mineral-k'},
	],
	Heal: [
		// green
		{tier: 'T3', title: 'LO', color: 'mineral-l'},
		{tier: 'T2', title: 'LHO2', color: 'mineral-l'},
		{tier: 'T1', title: 'XLHO2', color: 'mineral-l'},
	],
	Tough: [
		// white
		{tier: 'T3', title: 'GO', color: 'mineral-g'},
		{tier: 'T2', title: 'GHO2', color: 'mineral-g'},
		{tier: 'T1', title: 'XGHO2', color: 'mineral-g'},
	],
};

const BoostColors = {};
const BoostTiers = {};
for (const partType in Boosts) {
	for (const boost of Boosts[partType]) {
		BoostColors[boost.title] = boost.color;
		BoostTiers[boost.title] = boost.tier;
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
						<div class="dropdown" ref={dropdownEl}>
							<div class="dropdown-item">
								<span style="display: inline-block;width: 20px;opacity: 0.4;">--</span>
								<span class="dropdown-item-boost">none</span>
							</div>
							<StaticFor each={boosts}>{ boost => (
								<div class="dropdown-item">
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
			<BodyPartCompose label="Move" data={bodyParts.Move} />
			<BodyPartCompose label="Work" data={bodyParts.Work} />
			<BodyPartCompose label="Carry" data={bodyParts.Carry} />
			<BodyPartCompose label="Attack" data={bodyParts.Attack} />
			<BodyPartCompose label="Ranged" tooltip="Ranged Attack" data={bodyParts.Ranged} />
			<BodyPartCompose label="Heal" data={bodyParts.Heal} />
			<BodyPartCompose label="Tough" data={bodyParts.Tough} />
			<BodyPartCompose label="Claim" data={bodyParts.Claim} />
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