import { batch } from "pozitron-js";
import { clamp } from "../libs/utils";
import { If, StaticFor } from "../pozitron-web";

function BodyPartCompose({
	partType, data, tooltip, bodyPartsList, boosts,
	getBoostColor, getBoostTier, getBoostTooltip
}) {
	function increaseCount(e) {
		if (data.count === 50) {
			return;
		}
		const inc = e.shiftKey ? 5 : 1;
		batch(() => {
			data.count = clamp(data.count + inc, 0, 50);
			bodyPartsList.add(partType, inc);
		});
	}

	function decreaseCount(e) {
		if (data.count === 0) {
			return;
		}
		const inc = e.shiftKey ? 5 : 1;
		batch(() => {
			data.count = clamp(data.count - inc, 0, 50);
			bodyPartsList.remove(partType, inc);
		});
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

	return (
		<div
			class="body-compose-part"
			style={`--cl-part: var(--cl-part-${partType.toLowerCase()})`}
			classList={{
				'part-has-boost': () => (data.boost !== ''),
				'part-has-count': () => data.count > 0
			}}
		>
			<If condition={boosts}>{[
				() => (
					<button
						class="btn-body-compose-boost"
						title={() => getBoostTooltip(data.boost)}
						onClick={handleButtonBoostClick}
						onFocusOut={handleButtonBoostFocusOut}
					>
						<If condition={() => data.boost}>{[
							() => <span>{() => getBoostTier(data.boost)}</span>,
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
				<span>{partType}</span>
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

function PanelBodyComposeParts({
	bodyParts, bodyPartsList, clear,
	Boosts, getBoostColor, getBoostTier, getBoostTooltip
}) {
	const params = { bodyPartsList, getBoostColor, getBoostTier, getBoostTooltip };
	return (
		<div id="panel-body-compose-parts">
			<div style="margin-bottom: -45px;">
				<button
					class="btn-body-parts-clear"
					onClick={clear} onMouseDown={e => e.preventDefault()}
				>Clear</button>
			</div>
			<BodyPartCompose partType="Move" boosts={Boosts['Move']} tooltip="Move - 50 EN" data={bodyParts.Move} {...params} />
			<BodyPartCompose partType="Work" boosts={Boosts['Work']} tooltip="Work - 100 EN" data={bodyParts.Work} {...params} />
			<BodyPartCompose partType="Carry" boosts={Boosts['Carry']} tooltip="Carry - 50 EN" data={bodyParts.Carry} {...params} />
			<BodyPartCompose partType="Attack" boosts={Boosts['Attack']} tooltip="Attack - 80 EN" data={bodyParts.Attack} {...params} />
			<BodyPartCompose partType="Ranged" boosts={Boosts['Ranged']} tooltip="Ranged Attack - 150 EN" data={bodyParts.Ranged} {...params} />
			<BodyPartCompose partType="Heal" boosts={Boosts['Heal']} tooltip="Heal - 250 EN" data={bodyParts.Heal} {...params} />
			<BodyPartCompose partType="Tough" boosts={Boosts['Tough']} tooltip="Tough - 10 EN" data={bodyParts.Tough} {...params} />
			<BodyPartCompose partType="Claim" tooltip="Claim - 600 EN" data={bodyParts.Claim} bodyPartsList={bodyPartsList} />
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