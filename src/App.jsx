import { render } from "pozitron-js/render";
import { store } from "./pozitron-store";
import PanelCreepPreview from "./components/PanelCreepPreview";
import PanelBodyComposeParts from "./components/PanelBodyComposeParts";
import PanelBodyParts from "./components/PanelBodyParts";
import { batch, memo, subscribe } from "pozitron-js";

const BODY_PART_HEALTH = 100;

const CARRY_CAPACITY = 50;
const WORK_HARVEST_ENERGY = 2;
// const WORK_UPGRADE_ENERGY = 1;
const WORK_UPGRADE_PTS = 1;

const WORK_BUILD_ENERGY = 5;
const WORK_BUILD_PROGRESS = 5;
const WORK_REPAIR_ENEGRY = 1;
const WORK_REPAIR_HP = 100;
const WORK_DISMANTLE_HP = 50;
const WORK_DISMANTLE_ENERGY = 0.25; // DISMANTLE_POWER * DISMANTLE_COST

const DAMAGE_MELEE = 30;
const DAMAGE_RANGED = 10; // RMA 10/4/1

const HEAL_ADJACENT = 12;
const HEAL_RANGED = 4; // RMH 4

const BodyPartsCost = {
	Move: 50,
	Work: 100,
	Carry: 50,
	Attack: 80,
	Ranged: 150,
	Heal: 250,
	Tough: 10,
	Claim: 600,
};

const BoostsEfficiency = {
	Move: {
		'': 1,
		'ZO': 2,
		'ZHO2': 3,
		'XZHO2': 4,
	},
	WorkHarvest: {
		'UO': 3,
		'UHO2': 5,
		'XUHO2': 7,
	},
	WorkBuild: { // build and repair both use same factor
		'LH': 1.5,
		'LH2O': 1.8,
		'XLH2O': 2,
	},
	WorkDismantle: {
		'ZH': 2,
		'ZH2O': 3,
		'XZH2O': 4,
	},
	WorkUpgrade: {
		'GH': 1.5,
		'GH2O': 1.8,
		'XGH2O': 2,
	},
	Carry: {
		'': 1,
		'KH': 2,
		'KH2O': 3,
		'XKH2O': 4,
	},
	Attack: {
		'': 1,
		'UH': 2,
		'UH2O': 3,
		'XUH2O': 4,
	},
	Ranged: {
		'': 1,
		'KO': 2,
		'KHO2': 3,
		'XKHO2': 4,
	},
	Heal: {
		'': 1,
		'LO': 2,
		'LHO2': 3,
		'XLHO2': 4,
	},
	Tough: { // effectiveHp = 1 / value
		'': 1,
		'GO': 0.7,
		'GHO2': 0.5,
		'XGHO2': 0.3,
	},
};

function AppData() {

	function bodyPartData(data = {}) {
		return store({
			count: data.count || 0,
			boost: data.boost || '',
		});
	}

	const data = JSON.parse(localStorage.getItem('bodyParts') || '{}');
	const bodyParts = {
		Move: bodyPartData(data.Move),
		Work: bodyPartData(data.Work),
		Carry: bodyPartData(data.Carry),
		Attack: bodyPartData(data.Attack),
		Ranged: bodyPartData(data.Ranged),
		Heal: bodyPartData(data.Heal),
		Claim: bodyPartData(data.Claim),
		Tough: bodyPartData(data.Tough),
	};

	subscribe(() => JSON.stringify(bodyParts), (bodyParts) => {
		localStorage.setItem('bodyParts', bodyParts);
	}, {defer: true});

	const partsCount = memo(() => {
		let count = 0;
		for (const partType in bodyParts) {
			count += bodyParts[partType].count;
		}
		return count;
	}, {static: true});

	const cost = memo(() => {
		let count = 0;
		for (const partType in bodyParts) {
			count += BodyPartsCost[partType] * bodyParts[partType].count;
		}
		return count;
	}, {static: true});

	function getMoveTicks(terrianCost, isFull) {
		const moveParts = bodyParts.Move.count;
		const boostMultiplier = BoostsEfficiency.Move[bodyParts.Move.boost];
		const fatigueParts = partsCount() - moveParts - (isFull ? 0 : bodyParts.Carry.count);
		if (moveParts === 0) {
			return 0;
		}
		if (fatigueParts === 0) {
			return 1;
		}
		return Math.ceil((fatigueParts * terrianCost) / (moveParts * boostMultiplier * 2));
	}

	function health() {
		const toughParts = bodyParts.Tough.count;
		const boostFactor = BoostsEfficiency.Tough[bodyParts.Tough.boost];
		return Math.round(BODY_PART_HEALTH * (partsCount() - toughParts + toughParts) / boostFactor);
	}

	function healthByTough() {
		const toughParts = bodyParts.Tough.count;
		const boostFactor = BoostsEfficiency.Tough[bodyParts.Tough.boost];
		return Math.round(BODY_PART_HEALTH * toughParts / boostFactor);
	}

	const stats = {
		moveRoad: () => getMoveTicks(1, false),
		moveRoadFull: () => getMoveTicks(1, true),
		movePlain: () => getMoveTicks(2, false),
		movePlainFull: () => getMoveTicks(2, true),
		moveSwamp: () => getMoveTicks(10, false),
		moveSwampFull: () => getMoveTicks(10, true),

		partsCount,
		cost,
		health,
		healthByTough,
		capacity: () => (
			bodyParts.Carry.count * CARRY_CAPACITY *
			BoostsEfficiency.Carry[bodyParts.Carry.boost]
		),

		// upgradeEnergy: () => bodyParts.Work.count * WORK_UPGRADE_ENERGY, // boosted does not use more energy
		upgrade: () => Math.floor(
			bodyParts.Work.count * WORK_UPGRADE_PTS *
			(BoostsEfficiency.WorkUpgrade[bodyParts.Work.boost] || 1)
		),
		harvest: () => (
			bodyParts.Work.count * WORK_HARVEST_ENERGY *
			(BoostsEfficiency.WorkHarvest[bodyParts.Work.boost] || 1)
		),

		buildEnergy: () => bodyParts.Work.count * WORK_BUILD_ENERGY, // boosted does not use more energy
		buildProgress: () => Math.floor(
			bodyParts.Work.count * WORK_BUILD_PROGRESS *
			(BoostsEfficiency.WorkBuild[bodyParts.Work.boost] || 1)
		),

		repairEnergy: () => bodyParts.Work.count * WORK_REPAIR_ENEGRY, // boosted does not use more energy
		repairHp: () => Math.floor(
			bodyParts.Work.count * WORK_REPAIR_HP *
			(BoostsEfficiency.WorkBuild[bodyParts.Work.boost] || 1)
		),

		dismantleEnergy: () => Math.floor(
			bodyParts.Work.count * WORK_DISMANTLE_ENERGY *
			(BoostsEfficiency.WorkDismantle[bodyParts.Work.boost] || 1)
		),
		dismantleHp: () => (
			bodyParts.Work.count * WORK_DISMANTLE_HP *
			(BoostsEfficiency.WorkDismantle[bodyParts.Work.boost] || 1)
		),
		
		damageMelee: () => (
			bodyParts.Attack.count * DAMAGE_MELEE *
			BoostsEfficiency.Attack[bodyParts.Attack.boost]
		),
		damageRanged: () => (
			bodyParts.Ranged.count * DAMAGE_RANGED *
			BoostsEfficiency.Ranged[bodyParts.Ranged.boost]
		),

		healAdjacent: () => (
			bodyParts.Heal.count * HEAL_ADJACENT *
			BoostsEfficiency.Heal[bodyParts.Heal.boost]
		),
		healRanged: () => (
			bodyParts.Heal.count * HEAL_RANGED *
			BoostsEfficiency.Heal[bodyParts.Heal.boost]
		),
	};

	const bodyPartsOrder = ['Tough', 'Work', 'Carry', 'Ranged', 'Attack', 'Heal', 'Claim', 'Move'];
	const getBodyParts = memo(() => {
		const body = [];
		for (const partType of bodyPartsOrder) {
			const partsCount = bodyParts[partType].count;
			const boost = bodyParts[partType].boost;
			for (let i = 0; i < partsCount; i++) {
				body.push({ type: partType, boost, key: `${partType}:${boost}` });
				if (body.length >= 50) {
					break;
				}
			}
			if (body.length >= 50) {
				break;
			}
		}
		for (let i = body.length; i < 50; i++) {
			body.push({ type: '', boost: '', key: '' });
		}
		return body;
	}, {static: true});

	function clear() {
		batch(() => {
			for (const partType in bodyParts) {
				const bodyPart = bodyParts[partType];
				bodyPart.count = 0;
				bodyPart.boost = '';
			}
		});
	}

	return {
		bodyParts, stats,
		getBodyParts, clear,
	};
}

function App() {
	document.getElementById('app').style.opacity = '';

	const {
		bodyParts, stats,
		getBodyParts, clear,
	} = AppData();

	render(PanelCreepPreview, document.getElementById('panel-creep-preview'), { bodyParts });

	render(PanelBodyComposeParts, document.getElementById('panel-body-compose-parts'), {
		bodyParts, clear
	});

	render(PanelBodyParts, document.getElementById('panel-body-parts'), {
		bodyParts, getBodyParts, stats
	});
}

export default App;