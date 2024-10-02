import { clamp } from "../libs/utils";

function BodyPartCompose(props) {
	const { label, data, tooltip } = props;
	const partType = props.label.toLowerCase();

	function increaseCount(e) {
		e.target.closest('button').blur();
		const inc = e.shiftKey ? 5 : 1;
		data.count = clamp(data.count + inc, 0, 50);
	}

	function decreaseCount(e) {
		e.target.closest('button').blur();
		const inc = e.shiftKey ? 5 : 1;
		data.count = clamp(data.count - inc, 0, 50);
	}

	return (
		<div class="body-compose-part" classList={{'part-has-count': () => data.count > 0}} title={tooltip} style={`--cl-part: var(--cl-part-${partType})`}>
			<button class="btn-body-compose-boost"><span>T1</span><span class="boost-type">{data.boost}</span></button>
			<div class="body-compose-part-title">
				<span>{label}</span>
				<div class="body-compose-part-count">{() => data.count}</div>
			</div>
			<button
				class="btn-body-compose" title="Increase parts count"
				onClick={increaseCount}
			><i class="mdi mdi-plus" /></button>
			<button
				class="btn-body-compose" title="Decrease parts count"
				onClick={decreaseCount}
			><i class="mdi mdi-minus" /></button>
		</div>
	);
}

function PanelBodyComposeParts({ bodyParts, clear }) {
	function handleClear(e) {
		e.target.closest('button').blur();
		clear();
	}

	return (
		<div id="panel-body-compose-parts">
			<div style="margin-bottom: -45px;">
				<button class="btn-body-parts-clear" onClick={handleClear}>Clear</button>
			</div>
			<BodyPartCompose label="Move" data={bodyParts.Move} />
			<BodyPartCompose label="Work" data={bodyParts.Work} />
			<BodyPartCompose label="Carry" data={bodyParts.Carry} />
			<BodyPartCompose label="Attack" data={bodyParts.Attack} />
			<BodyPartCompose label="Ranged" tooltip="Ranged Attack" data={bodyParts.Ranged} />
			<BodyPartCompose label="Heal" data={bodyParts.Heal} />
			<BodyPartCompose label="Claim" data={bodyParts.Claim} />
			<BodyPartCompose label="Tough" data={bodyParts.Tough} />
			<div style="margin-top: 6px;text-align: right;font-size: 1.2rem;margin-right: 8px;color: rgba(183, 189, 202, 0.4);">
				<span style="font-size: 1.0rem;vertical-align: top;margin-right: 4px;line-height: 1.5rem;">±</span>
				<span style="margin-right: 15px">5</span>Shift + <i class="mdi mdi-mouse" style="opacity: 0.5;" />
				<span style="overflow: hidden;width: 9px;display: inline-block;vertical-align: top;height: 11px;margin-left: -19px;margin-right: 9px;">
					<i class="mdi mdi-mouse" />
				</span>
			</div>
		</div>
	);
}

export default PanelBodyComposeParts;