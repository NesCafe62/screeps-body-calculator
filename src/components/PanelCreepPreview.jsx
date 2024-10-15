import { Svg } from "../libs/utils";
import { Index } from "../pozitron-web";

const ANGLE_PER_SEGMENT = Math.PI / 50; // 3.6 degrees for each side
const BODY_RADIUS = 90;
const BODY_CENTER = 100;

function PanelCreepPreview({ bodyParts, bodyPartsText }) {
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

	function getPartsPreview() {
		const parts = [];
		for (const partType of ['Claim', 'Heal', 'Ranged', 'Attack', 'Work']) {
			const count = bodyParts[partType].count;
			if (count > 0) {
				parts.push({
					type: partType.toLowerCase(),
					count, path: '', key: '',
				});
			}
		}
		parts.sort((a, b) => b.count - a.count);
		let count = 0;
		for (let i = parts.length - 1; i >= 0; i--) {
			const part = parts[i];
			count += part.count;
			part.path = getArcPath(count);
			part.key = `${i}:${part.type}:${count}`;
		}
		return parts;
	}

	return (
		<div id="panel-creep-preview">
			<div style="width: 0;">
				<div class="body-parts-text">{bodyPartsText}</div>
			</div>
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
					<Index each={getPartsPreview} key="key">{ part => (
						<Svg tag="path" fill={`var(--cl-part-${part.type})`} d={part.path} />
					)}</Index>
					<Svg tag="circle" cx="100" cy="100" fill="rgb(85,85,85)" style="stroke-width: 6; stroke: rgb(23,26,34);" r="55" />
				</Svg>
			</div>
		</div>
	)
}

export default PanelCreepPreview;