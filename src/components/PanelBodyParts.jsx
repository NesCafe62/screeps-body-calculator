import { memo } from 'pozitron-js';
import { Index } from '../pozitron-web';

function BodyParts({ getBodyParts }) {
	function getTooltip(bodyPart) {
		if (!bodyPart.type) {
			return undefined;
		}
		return bodyPart.type + (bodyPart.boost ? ` [${bodyPart.boost}]` : '');
	}
	return (
		<div class="body-parts">
			<Index each={getBodyParts} key="key">{ bodyPart => (
				<div
					class={'body-part' + (bodyPart.boost ? ' body-part-boosted' : '')}
					style={bodyPart.type ? `background-color: var(--cl-part-${bodyPart.type.toLowerCase()});` : undefined}
					title={getTooltip(bodyPart)}
				/>
			)}</Index>
		</div>
	);
}

function PanelBodyParts({ bodyParts, getBodyParts, stats }) {
	const partsCountWarning = memo(() => (
		stats.partsCount() > 50
			? 'Creep size exceeds the maximum of 50 parts'
			: ''
	), {static: true});
	return (
		<div id="panel-body-parts">
			<div class="creep-metric-row" style="margin-bottom: 20px">
				<span title="Creep health" style="display: block;">
					<i class="mdi mdi-heart" style="font-size: 1.1rem;vertical-align: top;line-height: 1rem;margin-right: 5px;" />{stats.health}
				</span>
				<span style="display: block;flex-grow: 1;" />
				<span
					class="creep-total-parts-count"
					classList={{ 'max-parts-count-warning': partsCountWarning }}
					title={partsCountWarning}
				>
					<i class="mdi mdi-alert-rhombus-outline"/>{stats.partsCount} parts
				</span>
			</div>
			<BodyParts getBodyParts={getBodyParts} />
			<div class="creep-metric-row" style="margin-top: 20px;">
				<span style="display: inline-block;color: var(--cl-part-work);">
					<i class="mdi mdi-lightning-bolt" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Cost</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.cost}</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;">EN</span>
				</span>
			</div>
			<div class="creep-metric-row" style="margin-top: 20px;">
				<span style="display: inline-block;">
					<i class="mdi mdi-road-variant" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Road</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;color: #65FD62;" innerHTML={stats.moveRoad}></span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'tile &#x2044; t'} />
				</span>
			</div>
			<div class="creep-metric-row" style="margin-top: 15px;">
				<span style="display: inline-block;">
					<i class="mdi mdi-grass" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Plain</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;color: #F9B738;" innerHTML={stats.movePlain} />
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'tile &#x2044; t'} />
				</span>
			</div>
			<div class="creep-metric-row" style="margin-top: 15px;">
				<span style="display: inline-block;">
					<i class="mdi mdi-water" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Swamp</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;color: #F93842;" innerHTML={stats.moveSwamp} />
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'tile &#x2044; t'} />
				</span>
			</div>

			<div class="creep-metric-row" style="margin-top: 15px;">
				<span style="display: inline-block;">
					<i class="mdi mdi-package-variant" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Capacity</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.capacity}</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;"></span>
				</span>
			</div>

			<div
				class="creep-metric-group"
				classList={{ 'creep-metric-group-visible': () => bodyParts.Work.count > 0 }}
			>
				<div class="creep-metric-row" style="margin-top: 20px;">
					<span style="display: inline-block;color: var(--cl-part-work);">
						<i class="mdi mdi-pickaxe" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
						<span style="display: inline-block;">Harvest</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.harvest}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'EN &#x2044; t'} />
					</span>
				</div>
				<div class="creep-metric-row" style="margin-top: 15px;">
					<span style="display: inline-block;color: var(--cl-part-work);">
						<i class="mdi mdi-hexagon-slice-1" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
						<span style="display: inline-block;">Upgrade</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.upgrade}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'EN &#x2044; t'} />
					</span>
				</div>
				<div class="creep-metric-row" style="margin-top: 15px;">
					<span style="display: inline-block;color: var(--cl-part-work);">
						<i class="mdi mdi-hammer-wrench" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
						<span style="display: inline-block;">Build</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.buildEnergy}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'EN &#x2044; t'} />
					</span>
				</div>
				<div class="creep-metric-row" style="margin-top: 10px;">
					<span style="display: inline-block;">
						<span style="width: 109px;display: inline-block;"></span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.buildHp}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'HP &#x2044; t'} />
					</span>
				</div>
				<div class="creep-metric-row" style="margin-top: 15px;">
					<span style="display: inline-block;color: var(--cl-part-work);">
						<i class="mdi mdi-tools" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
						<span style="display: inline-block;">Repair</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.repairEnergy}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'EN &#x2044; t'} />
					</span>
				</div>
				<div class="creep-metric-row" style="margin-top: 10px;">
					<span style="display: inline-block;">
						<span style="width: 109px;display: inline-block;"></span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.repairHp}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'HP &#x2044; t'} />
					</span>
				</div>
				<div class="creep-metric-row" style="margin-top: 15px;">
					<span style="display: inline-block;color: var(--cl-part-work);">
						<i class="mdi mdi-hand-saw" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
						<span style="display: inline-block;">Dismantle</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.dismantleEnergy}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'EN &#x2044; t'} />
					</span>
				</div>
				<div class="creep-metric-row" style="margin-top: 10px;">
					<span style="display: inline-block;">
						<span style="width: 109px;display: inline-block;"></span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.dismantleHp}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'HP &#x2044; t'} />
					</span>
				</div>
			</div>

			<div
				class="creep-metric-group"
				classList={{ 'creep-metric-group-visible': () => bodyParts.Attack.count > 0 }}
			>
				<div class="creep-metric-row" style="margin-top: 20px;">
					<span style="display: inline-block;color: var(--cl-part-attack);">
						<i class="mdi mdi-sword-cross" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
						<span style="display: inline-block;">Melee</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.damageMelee}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'HP &#x2044; t'} />
					</span>
				</div>
			</div>
			<div
				class="creep-metric-group"
				classList={{ 'creep-metric-group-visible': () => bodyParts.Ranged.count > 0 }}
			>
				<div class="creep-metric-row" style="margin-top: 15px;">
					<span style="display: inline-block;color: var(--cl-part-ranged);">
						<i class="mdi mdi-target" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
						<span style="display: inline-block;">Ranged</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.damageRanged}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'HP &#x2044; t'} />
					</span>
				</div>
			</div>
			<div
				class="creep-metric-group"
				classList={{ 'creep-metric-group-visible': () => bodyParts.Heal.count > 0 }}
			>
				<div class="creep-metric-row" style="margin-top: 15px;">
					<span style="display: inline-block;color: var(--cl-part-heal);">
						<i class="mdi mdi-hospital-box" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
						<span style="display: inline-block;">Heal</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.healAdjacent}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'HP &#x2044; t'} />
					</span>
				</div>
			</div>
		</div>
	);
}

export default PanelBodyParts;