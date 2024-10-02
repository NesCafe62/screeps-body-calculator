import { Svg } from "../libs/utils";

function PanelCreepPreview() {
	// <circle cx="100" cy="100" fill="rgb(34,34,34)" style="stroke-width: 0; stroke: rgb(85,85,85);" r="90"></circle>
	return (
		<div id="panel-creep-preview">
			<div class="creep-preview">
				<div class="creep-preview-shadow" />
				<Svg
					viewBox="0 0 200 200"
					style="position: relative" width="200" height="200"
				>
					<Svg tag="path" fill="var(--cl-part-heal)" d="M100,100 L22,55 A90,90 0 0,1 178,55 Z" />
					<Svg tag="path" fill="var(--cl-part-move)" d="M100,100 L178,145 A90,90 0 0,1 22,145 Z" />
					<Svg tag="circle" cx="100" cy="100" fill="rgb(85,85,85)" style="stroke-width: 6; stroke: rgb(24,24,24);" r="55" />
				</Svg>
			</div>
		</div>
	)
}

export default PanelCreepPreview;