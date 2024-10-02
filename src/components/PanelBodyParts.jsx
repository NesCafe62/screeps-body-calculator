import { Index } from '../pozitron-web';

function BodyParts({ getBodyParts }) {
	return (
		<div class="body-parts">
			<Index each={getBodyParts} key="type">{ bodyPart => (
				<div
					class={'body-part' + (bodyPart.type ? ` body-part-${bodyPart.type.toLowerCase()}` : '')}
					title={bodyPart.type || undefined}
				/>
			)}</Index>
		</div>
	);
}

function PanelBodyParts({ getPartsCount, getHealth, getBodyParts, stats }) {
	return (
		<div id="panel-body-parts">
			<div class="creep-metric-row" style="margin-bottom: 20px">
				<span title="Creep health" style="display: block;">
					<i class="mdi mdi-heart" style="font-size: 1.1rem;vertical-align: top;line-height: 1rem;margin-right: 5px;" />{getHealth}
				</span>
				<span style="display: block;flex-grow: 1;" />
				<span style="display: block;text-align: right;">{getPartsCount} parts</span>
			</div>
			<BodyParts getBodyParts={getBodyParts} />
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

			<div class="creep-metric-row" style="margin-top: 20px;">
				<span style="display: inline-block;color: rgb(255,229,109);">
					<i class="mdi mdi-pickaxe" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Harvest</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.harvest}</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'EN &#x2044; t'} />
				</span>
			</div>
			<div class="creep-metric-row" style="margin-top: 15px;">
				<span style="display: inline-block;color: rgb(255,229,109);">
					<i class="mdi mdi-hexagon-slice-1" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Upgrade</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.upgrade}</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'EN &#x2044; t'} />
				</span>
			</div>
			<div class="creep-metric-row" style="margin-top: 15px;">
				<span style="display: inline-block;color: rgb(255,229,109);">
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
				<span style="display: inline-block;color: rgb(255,229,109);">
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
				<span style="display: inline-block;color: rgb(255,229,109);">
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

			<div class="creep-metric-row" style="margin-top: 20px;">
				<span style="display: inline-block;color: rgb(249,56,66);">
					<i class="mdi mdi-sword-cross" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Melee</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.damageMelee}</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'HP &#x2044; t'} />
				</span>
			</div>
			<div class="creep-metric-row" style="margin-top: 15px;">
				<span style="display: inline-block;color: rgb(93,128,178);">
					<i class="mdi mdi-target" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Ranged</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.damageRanged}</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'HP &#x2044; t'} />
				</span>
			</div>
			<div class="creep-metric-row" style="margin-top: 15px;">
				<span style="display: inline-block;color: #65FD62;">
					<i class="mdi mdi-hospital-box" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Heal</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.healAdjacent}</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'HP &#x2044; t'} />
				</span>
			</div>
		</div>
	);
}

export default PanelBodyParts;