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
      // Remove the dead reserver from its room
      if (Memory.creeps[name] && Memory.creeps[name].role === 'reserver') {
        Memory.roomsToReserve.forEach((room) => {
          if (room.name === Memory.creeps[name].room) {
            room.reserver = null;
          }
        })
      }
      // Remove the dead remote miner from its room
      if (Memory.creeps[name] && Memory.creeps[name].role === 'remote-miner') {
        Memory.roomsToReserve.forEach((room) => {
          _.remove(room.miners, (miner) => miner.id === Memory.creeps[name].id)
        })
      }
      // Forget the creep
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log(`💀 RIP ${name} 💀`);
      }
    }
  },

  breedFrom: function (spawn) {
    const energy = spawn.room.energyCapacityAvailable;
    const sources = spawn.room.find(FIND_SOURCES);
    const storage = spawn.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_STORAGE });
    const containers = spawn.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_CONTAINER });
    let lvl = Math.floor((energy - 300) / 250);
    lvl = lvl > 4 ? 4 : lvl;

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
    if (storage.length && containers.length && lvl >= 4) {
      limits = {
        harvesters: 0,
        builders  : 2,
        upgraders : 1,
        repairers : 0,
        miners    : containers.length,
        couriers  : 2,
      };
    }

    // Constructing bodies
    const genericBody = [...workParts, ...carryParts, ...moveParts];
    const minerBody = Array(5).fill(WORK).concat(Array(3).fill(MOVE));
    const partMultiplier = Math.floor(energy / 3 / 50) > 6 ? 6 : Math.floor(energy / 3 / 50);
    const courierBody = Array(partMultiplier * 2).fill(CARRY).concat(Array(partMultiplier).fill(MOVE));
    const reserverBody = Array(2).fill(CLAIM).concat(Array(2).fill(MOVE));
    // Calculating their cost
    const genericCost = calculateCost(genericBody); // up to 1300
    const minerCost = calculateCost(minerBody); // 650
    const courierCost = calculateCost(courierBody); // 900
    const reserverCost = calculateCost(reserverBody); // 1300

    // Count of all sie creeps.
    const harvesters = _.filter(Game.creeps, c => c.memory.role === 'harvester').length;
    const builders = _.filter(Game.creeps, c => c.memory.role === 'builder').length;
    const upgraders = _.filter(Game.creeps, c => c.memory.role === 'upgrader').length;
    const repairers = _.filter(Game.creeps, c => c.memory.role === 'repairer').length;
    const miners = _.filter(Game.creeps, c => c.memory.role === 'miner');
    const couriers = _.filter(Game.creeps, c => c.memory.role === 'courier').length;
    const reservers = _.filter(Game.creeps, c => c.memory.role === 'reserver').length;
    const remoteMiners = _.filter(Game.creeps, c => c.memory.role === 'remote-miner').length;

    const suffix = `(${lvl})-${(new Date()).toLocaleTimeString('hr')}`;
    // Advanced Economy
    if (miners.length < limits.miners && energy >= minerCost) {
      // Figure out what resource/container is empty in the room
      let availableContainers = _.filter(containers, (c) => {
        let available = false;
        miners.forEach(m => m.memory.target && m.memory.target.id === c.id ? null : available = true);
        return available;
      });

      // Attach it to the miner
      if (availableContainers.length > 0) {
        spawn.spawnCreep(minerBody, 'M' + suffix, {
          memory: {
            role: 'miner', level: lvl, target: availableContainers[0],
          },
        });
      }
    }
    else if (couriers < limits.couriers && energy >= courierCost) {
      spawn.spawnCreep(courierBody, 'C' + suffix, { memory: { role: 'courier', level: lvl } });
    }
    else if (energy >= genericCost) {
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
    // Cross room creeps
    else if (roomsMissingReservers().length && energy >= reserverCost) {
      roomsMissingReservers()[0].reserver = true;
      spawn.spawnCreep(reserverBody, 'ReR' + suffix, {
        memory: {
          role : 'reserver',
          level: lvl,
          room : roomsMissingReservers()[0],
        },
      });
    }
    else if (roomMissingMiners() && energy >= minerCost) {
      let room = roomMissingMiners();
      const containers = room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_CONTAINER });
      let availableContainers = _.filter(containers, (c) => {
        let available = false;
        miners.forEach(m => m.memory.target && m.memory.target.id === c.id ? null : available = true);
        return available;
      });

      spawn.spawnCreep(genericBody, 'ReM' + suffix, {
        memory: {
          role: 'remote-miner', level: lvl, room, target: availableContainers[0],
        },
      });
    }
    else if (roomsMissingCouriers().length && energy >= courierCost) {
      roomsMissingCouriers()[0].courier = true;
      spawn.spawnCreep(reserverBody, 'ReC' + suffix, {
        memory: {
          role       : 'remote-courier',
          level      : lvl,
          sourceRoom : roomsMissingCouriers()[0],
          depositRoom: Memory.home,
        },
      });
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

let calculateCost = function (body) {
  let cost = 0;

  body.forEach(p => {
    switch (p) {
      case CLAIM:
        cost += 600;
        break;
      case HEAL:
        cost += 250;
        break;
      case RANGED_ATTACK:
        cost += 150;
        break;
      case WORK:
        cost += 100;
        break;
      case ATTACK:
        cost += 80;
        break;
      case TOUGH:
        cost += 10;
        break;
      default:
        cost += 50;
    }
  });

  return cost;
};

let roomsMissingReservers = function () {
  return _.filter(Memory.roomsToReserve, (room) => !room.reserver)
};

let roomMissingMiners = function () {
  let missing = false;
  Memory.roomsToReserve.forEach(room => {
    if (room.miners.length >= room.sources) {
      missing = Game.rooms[room.name];
    }
  });

  return missing
};

let roomsMissingCouriers = function () {
  return _.filter(Memory.roomsToReserve, (room) => !room.courier)
};
