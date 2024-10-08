import { render } from "pozitron-js/render";
import { store } from "./pozitron-store";
import PanelCreepPreview from "./components/PanelCreepPreview";
import PanelBodyComposeParts from "./components/PanelBodyComposeParts";
import PanelBodyParts from "./components/PanelBodyParts";
import { batch, memo } from "pozitron-js";

const BODY_PART_HEALTH = 100;

const CARRY_CAPACITY = 50;
const WORK_HARVEST = 2;
const WORK_BUILD_ENERGY = 5;
const WORK_BUILD_HP = 5; // ?
const WORK_REPAIR_ENEGRY = 1;
const WORK_REPAIR_HP = 100;
const WORK_UPGRADE_ENERGY = 1;
const WORK_DISMANTLE_HP = 50;
const WORK_DISMANTLE_ENERGY = 0.25;

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

function AppData() {

	function bodyPartData(data = {}) {
		return store({
			count: data.count || 0,
			boost: data.boost || '',
		});
	}

	const bodyParts = {
		Move: bodyPartData({ count: 0, boost: '' }),
		Work: bodyPartData({ count: 0, boost: '' }),
		Carry: bodyPartData({ count: 0, boost: '' }),
		Attack: bodyPartData({ count: 0, boost: '' }),
		Ranged: bodyPartData({ count: 0, boost: '' }),
		Heal: bodyPartData({ count: 0, boost: '' }), // XLHO2
		Claim: bodyPartData({ count: 0, boost: '' }),
		Tough: bodyPartData({ count: 0, boost: '' }),
	};

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

	const stats = {
		moveRoad: () => '1',
		movePlain: () => '1' + '&#x2044;' + '2',
		moveSwamp: () => '1' + '&#x2044;' + '10',

		partsCount,
		cost,
		health: () => partsCount() * BODY_PART_HEALTH,
		capacity: () => bodyParts.Carry.count * CARRY_CAPACITY,

		upgrade: () => bodyParts.Work.count * WORK_UPGRADE_ENERGY,
		harvest: () => bodyParts.Work.count * WORK_HARVEST,

		buildEnergy: () => bodyParts.Work.count * WORK_BUILD_ENERGY,
		buildHp: () => bodyParts.Work.count * WORK_BUILD_HP,

		dismantleEnergy: () => Math.floor(bodyParts.Work.count * WORK_DISMANTLE_ENERGY),
		dismantleHp: () => bodyParts.Work.count * WORK_DISMANTLE_HP,
		
		repairEnergy: () => bodyParts.Work.count * WORK_REPAIR_ENEGRY,
		repairHp: () => bodyParts.Work.count * WORK_REPAIR_HP,

		damageMelee: () => bodyParts.Attack.count * DAMAGE_MELEE,
		damageRanged: () => bodyParts.Ranged.count * DAMAGE_RANGED,

		healAdjacent: () => bodyParts.Heal.count * HEAL_ADJACENT,
		healRanged: () => bodyParts.Heal.count * HEAL_RANGED,
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