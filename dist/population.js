// Population module handles how many creeps we have,
// and mourns for each one that dies.
module.exports = {
  mourn: function () {
    for (let name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log(`💀 RIP ${name} 💀`);
      }
    }
  },

  keep: function (spawn, limits) {
    const energy = spawn.room.energyCapacityAvailable;
    const lvl = Math.floor((energy - 300) / 250);
    let workParts = Array(2 + lvl).fill(WORK);
    let carryParts = Array(1 + lvl).fill(CARRY);
    let moveParts = Array(1 + lvl * 2).fill(MOVE);

    // Level specific mutations.
    if (lvl === 0) {
      workParts = Array(1).fill(WORK);
      carryParts = Array(2).fill(CARRY);
      moveParts = Array(2).fill(MOVE);
    }
    if (lvl >= 2) {
      limits.repairers = 1;
    }

    let body = [...workParts, ...carryParts, ...moveParts];
    let cost = 0;
    body.forEach(p => p === WORK ? cost += 100 : cost += 50);

    // Count of all sie creeps.
    const harvesters = _.filter(Game.creeps, c => c.memory.role === 'harvester').length;
    const builders = _.filter(Game.creeps, c => c.memory.role === 'builder').length;
    const upgraders = _.filter(Game.creeps, c => c.memory.role === 'upgrader').length;
    const repairers = _.filter(Game.creeps, c => c.memory.role === 'repairer').length;

    if (energy >= cost) {
      const suffix = `(${lvl})-${(new Date()).toLocaleTimeString('hr')}`;
      if (harvesters < limits.harvesters) {
        spawn.spawnCreep(body, 'H' + suffix, { memory: { role: 'harvester', level: lvl } });
      }
      else if (builders < limits.builders) {
        spawn.spawnCreep(body, 'B' + suffix, { memory: { role: 'builder', level: lvl } });
      }
      else if (upgraders < limits.upgraders) {
        spawn.spawnCreep(body, 'U' + suffix, { memory: { role: 'upgrader', level: lvl } });
      }
      else if (repairers < limits.repairers) {
        spawn.spawnCreep(body, 'R' + suffix, { memory: { role: 'repairer', level: lvl } });
      }
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
