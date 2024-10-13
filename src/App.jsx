import { render } from "pozitron-js/render";
import { store } from "./pozitron-store";
import PanelCreepPreview from "./components/PanelCreepPreview";
import PanelBodyComposeParts from "./components/PanelBodyComposeParts";
import PanelBodyParts from "./components/PanelBodyParts";
import { batch, memo, subscribe, voidSignal } from "pozitron-js";

const BODY_PART_HEALTH = 100;

const CARRY_CAPACITY = 50;
const WORK_HARVEST_ENERGY = 2;
// const WORK_UPGRADE_ENERGY = 1;
const WORK_UPGRADE_PTS = 1;
const SPAWN_TIME_PER_PART = 3;

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

const RCL_ENERGY_CAPACITY = {
	1: 300, // 300
	2: 550, // 50 * 5 + 300
	3: 800, // 50 * 10 + 300
	4: 1300, // 50 * 20 + 300
	5: 1800, // 50 * 30 + 300
	6: 2300, // 50 * 40 + 300
	7: 5600, // 100 * 50 + 300 * 2
	8: 12900, // 200 * 60 + 300 * 3
};
const CREEP_MAX_COST = RCL_ENERGY_CAPACITY[8];

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

const REGEXP_PARSE_URL = /(M|W|CL?|A|R|H|T)(\d+)(?:\[([^\]]+)\])?/g; // M3[ZO]W4C12

const URL_PARAMS_PART_TYPE = {
	'M': 'Move',
	'W': 'Work',
	'C': 'Carry',
	'A': 'Attack',
	'R': 'Ranged',
	'H': 'Heal',
	'T': 'Tough',
	'CL': 'Claim',
};

const URL_PARAMS_VALID_BOOSTS = {
	Move: ['ZO', 'ZHO2', 'XZHO2'],
	Work: ['UO', 'UHO2', 'XUHO2', 'LH', 'LH2O', 'XLH2O', 'ZH', 'ZH2O', 'XZH2O', 'GH', 'GH2O', 'XGH2O'],
	Carry: ['KH', 'KH2O', 'XKH2O'],
	Attack: ['UH', 'UH2O', 'XUH2O'],
	Ranged: ['KO', 'KHO2', 'XKHO2'],
	Heal: ['LO', 'LHO2', 'XLHO2'],
	Tough: ['GO', 'GHO2', 'XGHO2'],
	Claim: [],
};

function AppData() {

	function createBodyPartsList(initialItems = []) {
		const [track, notify] = voidSignal();
		let items = initialItems;

		function clear() {
			bodyPartsList.items = items = [];
			notify();
		}

		function add(partType, count = 1) {
			for (let i = 0; i < count; i++) {
				items.unshift(partType);
			}
			notify();
		}

		function remove(partType, count = 1) {
			let removeCount = count;
			for (let i = 0; i < items.length; i++) {
				if (items[i] === partType) {
					items.splice(i, 1);
					i--;
					removeCount--;
					if (removeCount === 0) {
						break;
					}
				}
			}
			notify();
		}

		function removeAt(index) {
			items.splice(index, 1);
			notify();
		}

		const bodyPartsList = {
			items,
			getItems: () => track(items),
			clear, add, remove, removeAt,
		};
		return bodyPartsList;
	}

	function createBodyPartData(data = {}) {
		return store({
			count: data.count || 0,
			boost: data.boost || '',
		});
	}

	function loadFromUrlParam() {
		let urlData = window.location.search;
		if (!urlData || urlData.substring(0, 6) !== '?body=') {
			return;
		}
		urlData = decodeURI(urlData.substring(6));
		const data = {};
		const partItems = [];
		const matches = urlData.matchAll(REGEXP_PARSE_URL);
		for (const match of matches) {
			let [_, part, count, boost] = match;
			count = Number.parseInt(count, 10);
			if (count <= 0) {
				continue;
			}
			const partType = URL_PARAMS_PART_TYPE[part];
			if (!partType) {
				continue;
			}
			if (!URL_PARAMS_VALID_BOOSTS[partType].includes(boost)) {
				boost = '';
			}
			if (!data[partType]) {
				data[partType] = { count, boost };
			} else {
				data[partType].count += count;
			}
			for (let i = 0; i < count; i++) {
				partItems.push(partType);
			}
		}
		return { data, partItems };
	}

	// compatibility with v1.1
	function generatePartItems(data) {
		const bodyPartsOrder = ['Tough', 'Work', 'Carry', 'Ranged', 'Attack', 'Heal', 'Claim', 'Move'];
		const items = [];
		for (const partType of bodyPartsOrder) {
			if (!data[partType]) {
				continue;
			}
			const count = data[partType].count;
			for (let i = 0; i < count; i++) {
				items.push(partType);
			}
		}
		return items;
	}

	function loadFromLocalStorage() {
		const data = JSON.parse(localStorage.getItem('bodyParts') || 'null');
		if (!data) {
			return { data: {}, partItems: [] };
		}
		let partItems = JSON.parse(localStorage.getItem('partItems') || 'null');
		if (!partItems) {
			partItems = generatePartItems(data);
		}
		return { data, partItems };
	}

	const { data, partItems } = loadFromUrlParam() || loadFromLocalStorage();

	const bodyPartsList = createBodyPartsList(partItems);
	const bodyParts = {
		Move: createBodyPartData(data.Move),
		Work: createBodyPartData(data.Work),
		Carry: createBodyPartData(data.Carry),
		Attack: createBodyPartData(data.Attack),
		Ranged: createBodyPartData(data.Ranged),
		Heal: createBodyPartData(data.Heal),
		Tough: createBodyPartData(data.Tough),
		Claim: createBodyPartData(data.Claim),
	};

	function removeBodyPartAt(index) {
		const partType = bodyPartsList.items[index];
		if (!partType) {
			return;
		}
		batch(() => {
			bodyParts[partType].count--;
			bodyPartsList.removeAt(index);
		});
	}

	subscribe([
		() => JSON.stringify(bodyParts),
		bodyPartsList.getItems
	], (bodyParts, partItems) => {
		localStorage.setItem('bodyParts', bodyParts);
		localStorage.setItem('partItems', JSON.stringify(partItems));
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

	function minRCL() {
		const creepCost = cost();
		for (const rcl in RCL_ENERGY_CAPACITY) {
			if (creepCost <= RCL_ENERGY_CAPACITY[rcl]) {
				return rcl;
			}
		}
		return null;
	}

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
		spawnTime: () => partsCount() * SPAWN_TIME_PER_PART,
		minRCL,
		maxCost: CREEP_MAX_COST,
		getEnergyCapacityAtRCL: (rcl) => RCL_ENERGY_CAPACITY[rcl || 8],
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

	// const bodyPartsOrder = ['Tough', 'Work', 'Carry', 'Ranged', 'Attack', 'Heal', 'Claim', 'Move'];
	const getBodyParts = memo(() => {
		const body = [];
		/* for (const partType of bodyPartsOrder) {
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
		} */
		for (const partType of bodyPartsList.getItems()) {
			const boost = bodyParts[partType].boost;
			body.push({ type: partType, boost, key: `${partType}:${boost}` });
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
			bodyPartsList.clear();
		});
		history.pushState({}, '', new URL(location.protocol + '//' + location.host + location.pathname));
	}

	function handleShare() {
		const savedBoosts = {};
		let prevPart = bodyPartsList.items[0];
		let count = 0;
		let urlParam = '';
		for (const partType of bodyPartsList.items.concat([''])) {
			if (partType === prevPart) {
				count++;
			} else {
				if (!prevPart) {
					break;
				}
				const part = (prevPart === 'Claim')
					? 'CL' : prevPart.charAt(0).toUpperCase();
				urlParam += part + count;
				if (!savedBoosts[prevPart]) {
					savedBoosts[prevPart] = true;
					const boost = bodyParts[prevPart].boost;
					if (boost) {
						urlParam += `[${boost}]`;
					}
				}
				count = 1;
			}
			prevPart = partType;
		}
		/* for (const partType in bodyParts) {
			const count = bodyParts[partType].count;
			if (count === 0) {
				continue;
			}
			const boost = bodyParts[partType].boost;
			const part = (partType === 'Claim')
				? 'CL' : partType.charAt(0).toUpperCase();
			urlParam += part + count;
			if (boost) {
				urlParam += `[${boost}]`;
			}
		} */
		const shareUrl = new URL(location);
		shareUrl.searchParams.set('body', urlParam);
		history.pushState({}, '', shareUrl);

		if (navigator.clipboard) {
			navigator.clipboard.writeText(shareUrl).then(() => {
				window.alert("Link copied");
			});
		} else {
			window.prompt("Copy to clipboard: Ctrl+C, Enter", shareUrl);
		}
	}

	function bodyPartsText() {
		let partsText = '', savedParts = {};
		for (const partType of bodyPartsList.getItems()) {
			if (savedParts[partType]) {
				continue;
			}
			savedParts[partType] = true;
			const count = bodyParts[partType].count;
			const part = (partType === 'Claim')
				? 'CL' : partType.charAt(0).toUpperCase();
			partsText += part + count + ' ';
		}
		/* for (const partType in bodyParts) {
			const count = bodyParts[partType].count;
			if (count > 0) {
				const part = (partType === 'Claim')
					? 'CL' : partType.charAt(0).toUpperCase();
				partsText += part + count + ' ';
			}
		} */
		return partsText;
	}

	return {
		bodyParts, bodyPartsList,
		bodyPartsText, removeBodyPartAt, stats,
		getBodyParts, clear, handleShare,
	};
}

function App() {
	document.getElementById('app').style.opacity = '';

	const {
		bodyParts, bodyPartsText,
		bodyPartsList, removeBodyPartAt, stats,
		getBodyParts, clear, handleShare,
	} = AppData();

	document.getElementById('btn-share').addEventListener('click', handleShare);

	render(PanelCreepPreview, document.getElementById('panel-creep-preview'), { bodyParts, bodyPartsText });

	render(PanelBodyComposeParts, document.getElementById('panel-body-compose-parts'), {
		bodyParts, bodyPartsList, clear
	});

	render(PanelBodyParts, document.getElementById('panel-body-parts'), {
		bodyParts, getBodyParts, removeBodyPartAt, stats
	});
}

export default App;