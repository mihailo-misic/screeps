// Population module handles how many creeps we have,
// and mourns for each one that dies.
let limits = {
  harvesters: 4,
  builders  : 2,
  upgraders : 1,
  repairers : 0,
  miners    : 0,
  couriers  : 0,
};

module.exports = {
  mourn: function () {
    for (let name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log(`💀 RIP ${name} 💀`);
      }
    }
  },

  keep: function (spawn) {
    const energy = spawn.room.energyCapacityAvailable;
    const sources = spawn.room.find(FIND_SOURCES).length;
    const storage = spawn.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_STORAGE }).length;
    const containers = spawn.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_CONTAINER }).length;
    const lvl = Math.floor((energy - 300) / 250);

    let workParts = Array(2 + lvl).fill(WORK);
    let carryParts = Array(1 + lvl).fill(CARRY);
    let moveParts = Array(1 + lvl * 2).fill(MOVE);

    // Level specific mutations.
    if (lvl === 0) {
      // At the beginning there were no roads
      workParts = Array(1).fill(WORK);
      carryParts = Array(2).fill(CARRY);
      moveParts = Array(2).fill(MOVE);
    }
    if (lvl >= 2) {
      // Now there are roads and they need to be repaired
      limits.repairers = 1;
    }
    if (lvl >= 3) {
      limits.builders = 1;
    }
    if (storage && containers === sources && lvl >= 4) {
      limits = {
        harvesters: 0,
        builders  : 3,
        upgraders : 1,
        repairers : 1,
        miners    : sources,
        couriers  : 1,
      }
    }

    // Constructing generic body and its cost
    let genericBody = [...workParts, ...carryParts, ...moveParts];
    const minerBody = Array(5).fill(WORK).concat(Array(3).fill(MOVE));
    const partMultiplier = Math.floor(energy / 3 / 50);
    const courierBody = Array(partMultiplier * 2).fill(CARRY).concat(Array(partMultiplier).fill(MOVE));

    let cost = 0;
    genericBody.forEach(p => p === WORK ? cost += 100 : cost += 50);
    let minerCost = 0;
    minerBody.forEach(p => p === WORK ? minerCost += 100 : minerCost += 50);
    let courierCost = 0;
    courierBody.forEach(p => p === WORK ? courierCost += 100 : courierCost += 50);

    // Count of all sie creeps.
    const harvesters = _.filter(Game.creeps, c => c.memory.role === 'harvester').length;
    const builders = _.filter(Game.creeps, c => c.memory.role === 'builder').length;
    const upgraders = _.filter(Game.creeps, c => c.memory.role === 'upgrader').length;
    const repairers = _.filter(Game.creeps, c => c.memory.role === 'repairer').length;
    const miners = _.filter(Game.creeps, c => c.memory.role === 'miner').length;
    const couriers = _.filter(Game.creeps, c => c.memory.role === 'courier').length;

    const suffix = `(${lvl})-${(new Date()).toLocaleTimeString('hr')}`;
    if (energy >= cost) {
      if (harvesters < limits.harvesters) {
        spawn.spawnCreep(genericBody, 'H' + suffix, { memory: { role: 'harvester', level: lvl } });
      }
      else if (builders < limits.builders) {
        spawn.spawnCreep(genericBody, 'B' + suffix, { memory: { role: 'builder', level: lvl } });
      }
      else if (upgraders < limits.upgraders) {
        spawn.spawnCreep(genericBody, 'U' + suffix, { memory: { role: 'upgrader', level: lvl } });
      }
      else if (repairers < limits.repairers) {
        spawn.spawnCreep(genericBody, 'R' + suffix, { memory: { role: 'repairer', level: lvl } });
      }
    }
    // Advanced
    if (miners < limits.miners && energy >= minerCost) {
      spawn.spawnCreep(minerBody, 'M' + suffix, { memory: { role: 'miner', level: lvl } });
    }
    else if (couriers < limits.couriers && energy >= courierCost) {
      spawn.spawnCreep(courierBody, 'C' + suffix, { memory: { role: 'courier', level: lvl } });
    }

    const { spawning } = spawn;
    if (spawning) {
      let spawningCreep = Game.creeps[spawning.name];
      spawn.room.visual.text(`👶 ${_.capitalize(spawningCreep.memory.role)} Level ${lvl}`,
          spawn.pos.x - 3, spawn.pos.y + 2,
          { align: 'left', opacity: 0.8 });
    }
  },
};
