import { Svg } from "../libs/utils";

const ANGLE_PER_SEGMENT = Math.PI / 50; // 3.6 degrees for each side
const BODY_RADIUS = 90;
const BODY_CENTER = 100;

function PanelCreepPreview({ bodyParts }) {
	// <circle cx="100" cy="100" fill="rgb(34,34,34)" style="stroke-width: 0; stroke: rgb(85,85,85);" r="90"></circle>

	function getArcPath(partsCount) {
		if (partsCount === 0) {
			return '';
		}
		let angle = partsCount * ANGLE_PER_SEGMENT;
		if (partsCount >= 50) {
			angle = Math.min(angle, Math.PI - 0.0001);
		}
		const x = BODY_CENTER - Math.sin(angle) * BODY_RADIUS;
		const x2 = BODY_CENTER * 2 - x;
		const y = BODY_CENTER - Math.cos(angle) * BODY_RADIUS;
		const flip = partsCount > 25 ? '1' : '0';
		return `M${BODY_CENTER},${BODY_CENTER} L${x},${y} A${BODY_RADIUS},${BODY_RADIUS} 0 ${flip},1 ${x2},${y} Z`;
	}

	function getArcPathBottom(partsCount) {
		if (partsCount === 0) {
			return '';
		}
		let angle = partsCount * ANGLE_PER_SEGMENT;
		if (partsCount >= 50) {
			angle = Math.min(angle, Math.PI - 0.0001);
		}
		const x = BODY_CENTER + Math.sin(angle) * BODY_RADIUS;
		const x2 = BODY_CENTER * 2 - x;
		const y = BODY_CENTER + Math.cos(angle) * BODY_RADIUS;
		const flip = partsCount > 25 ? '1' : '0';
		return `M${BODY_CENTER},${BODY_CENTER} L${x},${y} A${BODY_RADIUS},${BODY_RADIUS} 0 ${flip},1 ${x2},${y} Z`;
	}

	return (
		<div id="panel-creep-preview">
			<div class="creep-preview">
				<div class="creep-preview-shadow" />
				<div
					class="creep-preview-tough"
					classList={{ 'creep-preview-tough-visible': () => bodyParts.Tough.count > 0 }}
				/>
				<Svg
					viewBox="0 0 200 200"
					style="position: relative" width="200" height="200"
				>
					<Svg tag="path" fill="var(--cl-move-preview)" d={() => getArcPathBottom(bodyParts.Move.count)} />
					<Svg tag="path" fill="var(--cl-part-claim)" d={() => getArcPath(bodyParts.Work.count + bodyParts.Attack.count + bodyParts.Ranged.count + bodyParts.Heal.count + bodyParts.Claim.count)} />
					<Svg tag="path" fill="var(--cl-part-heal)" d={() => getArcPath(bodyParts.Work.count + bodyParts.Attack.count + bodyParts.Ranged.count + bodyParts.Heal.count)} />
					<Svg tag="path" fill="var(--cl-part-ranged)" d={() => getArcPath(bodyParts.Work.count + bodyParts.Attack.count + bodyParts.Ranged.count)} />
					<Svg tag="path" fill="var(--cl-part-attack)" d={() => getArcPath(bodyParts.Work.count + bodyParts.Attack.count)} />
					<Svg tag="path" fill="var(--cl-part-work)" d={() => getArcPath(bodyParts.Work.count)} />
					<Svg tag="circle" cx="100" cy="100" fill="rgb(85,85,85)" style="stroke-width: 6; stroke: rgb(23,26,34);" r="55" />
				</Svg>
			</div>
		</div>
	)
}

export default PanelCreepPreview;