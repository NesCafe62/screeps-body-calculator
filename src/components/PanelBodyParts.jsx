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

	function getMoveSpeed(moveTicks) {
		if (moveTicks > 1) {
			return '1' + '&#x2044;' + moveTicks;
		}
		return moveTicks;
	}

	function getMoveSpeedColor(moveTicks) {
		if (moveTicks === 0 || moveTicks >= 5) {
			return 'red';
		}
		if (moveTicks >= 3) {
			return 'orange';
		}
		if (moveTicks >= 2) {
			return 'yellow';
		}
		return 'green';
	}

	let prevHealthByTough = 0;
	function getHealthByTough() {
		const healthByTough = stats.healthByTough();
		if (healthByTough > 0) {
			prevHealthByTough = healthByTough;
		}
		return '(' + prevHealthByTough + ')';
	}

	function labelRCL() {
		const rcl = stats.minRCL();
		if (rcl === null) {
			return 'RCL <span style="font-size: 1.8rem;line-height: 1rem;vertical-align: top;position: relative;top: 1px;">&infin;</span>';
		}
		return `RCL ${rcl}`;
	}

	return (
		<div id="panel-body-parts">
			<div class="creep-metric-row" style="margin-bottom: 20px">
				<span title="Creep effective health" style="display: block;">
					<i class="mdi mdi-heart" style="font-size: 1.1rem;vertical-align: top;line-height: 1rem;margin-right: 5px;" />{stats.health}
				</span>
				<span
					class="creep-metric-health-by-tough"
					classList={{ 'creep-metric-visible': () => stats.healthByTough() > 0 }}
					title={() => (stats.healthByTough() > 0) ? 'Health by tough' : undefined}
				>{() => getHealthByTough()}</span>
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
				<span
					class="creep-metric-value-cost"
					style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;"
					title={() => (stats.cost() > stats.maxCost) ? 'Creep cost exceeds RCL8 energy capacity' : undefined}
					classList={{ 'max-cost-warning': () => stats.cost() > stats.maxCost }}
				>
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.cost}</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;">EN</span>
				</span>
			</div>
			<div class="creep-metric-row" style="margin-top: 10px;">
				<span style="display: inline-block;">
					<span style="display: inline-block;padding-left: 30px;" innerHTML={labelRCL} />
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">
						{() => stats.getEnergyCapacityAtRCL(stats.minRCL())}
					</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;">EN</span>
				</span>
			</div>
			<div class="creep-metric-row" style="margin-top: 10px;">
				<span style="display: inline-block;">
					<i class="mdi mdi-timer-outline" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Spawn time</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.spawnTime}</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;">ticks</span>
				</span>
			</div>

			<div class="creep-metric-row" style="margin-top: 15px;" title="Move speed on road">
				<span style="display: inline-block;">
					<i class="mdi mdi-road-variant" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Road</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span
						class={() => 'creep-metric-move-cl-' + getMoveSpeedColor(stats.moveRoad())}
						style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;"
						innerHTML={() => getMoveSpeed(stats.moveRoad())}
					/>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'tile &#x2044; t'} />
				</span>
			</div>
			<div
				class="creep-metric-group"
				classList={{ 'creep-metric-group-visible': () => bodyParts.Carry.count > 0 }}
			>
				<div class="creep-metric-row" style="margin-top: 10px;">
					<span style="display: inline-block;">
						<span style="width: 109px;display: inline-block;padding-left: 30px;">full</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span
							class={() => 'creep-metric-move-cl-' + getMoveSpeedColor(stats.moveRoadFull())}
							style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;"
							innerHTML={() => getMoveSpeed(stats.moveRoadFull())}
						/>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'tile &#x2044; t'} />
					</span>
				</div>
			</div>
			<div class="creep-metric-row" style="margin-top: 15px;" title="Move speed on plain">
				<span style="display: inline-block;">
					<i class="mdi mdi-grass" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Plain</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span
						class={() => 'creep-metric-move-cl-' + getMoveSpeedColor(stats.movePlain())}
						style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;"
						innerHTML={() => getMoveSpeed(stats.movePlain())}
					/>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'tile &#x2044; t'} />
				</span>
			</div>
			<div
				class="creep-metric-group"
				classList={{ 'creep-metric-group-visible': () => bodyParts.Carry.count > 0 }}
			>
				<div class="creep-metric-row" style="margin-top: 10px;">
					<span style="display: inline-block;">
						<span style="width: 109px;display: inline-block;padding-left: 30px;">full</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span
							class={() => 'creep-metric-move-cl-' + getMoveSpeedColor(stats.movePlainFull())}
							style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;"
							innerHTML={() => getMoveSpeed(stats.movePlainFull())}
						/>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'tile &#x2044; t'} />
					</span>
				</div>
			</div>
			<div class="creep-metric-row" style="margin-top: 15px;" title="Move speed on swamp">
				<span style="display: inline-block;">
					<i class="mdi mdi-water" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Swamp</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span
						class={() => 'creep-metric-move-cl-' + getMoveSpeedColor(stats.moveSwamp())}
						style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;"
						innerHTML={() => getMoveSpeed(stats.moveSwamp())}
					/>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'tile &#x2044; t'} />
				</span>
			</div>
			<div
				class="creep-metric-group"
				classList={{ 'creep-metric-group-visible': () => bodyParts.Carry.count > 0 }}
			>
				<div class="creep-metric-row" style="margin-top: 10px;">
					<span style="display: inline-block;">
						<span style="width: 109px;display: inline-block;padding-left: 30px;">full</span>
					</span>
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
						<span
							class={() => 'creep-metric-move-cl-' + getMoveSpeedColor(stats.moveSwampFull())}
							style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;"
							innerHTML={() => getMoveSpeed(stats.moveSwampFull())}
						/>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'tile &#x2044; t'} />
					</span>
				</div>
			</div>

			<div class="creep-metric-row" style="margin-top: 15px;">
				<span style="display: inline-block;">
					<i class="mdi mdi-package-variant" style="font-size: 1.3rem;vertical-align: top;line-height: 1rem;margin-right: 8px;" />
					<span style="display: inline-block;">Capacity</span>
				</span>
				<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;">
					<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.capacity}</span>
					<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" />
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
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;" title="Progress points per tick">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.upgrade}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'PT &#x2044; t'} />
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
					<span style="text-align: right;display: inline-block;flex-grow: 1;margin-right: -10px;" title="Progress points per tick">
						<span style="font-size: 1.3rem;vertical-align: top;display: inline-block;padding-right: 8px;line-height: 1rem;">{stats.buildProgress}</span>
						<span style="font-size: 0.8rem;min-width: 45px;display: inline-block;text-align: left;" innerHTML={'PT &#x2044; t'} />
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