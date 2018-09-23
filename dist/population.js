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
      // Forget the creep
      if (!Game.creeps[name]) {
        // Remove the dead reserver from its room
        if (Memory.creeps[name] && Memory.creeps[name].role === 'reserver') {
          Memory.rooms.forEach((room) => {
            if (room.name === Memory.creeps[name].room.name) {
              room.reserver = false;
            }
          })
        }
        // Remove the dead remote defender from its room
        if (Memory.creeps[name] && Memory.creeps[name].role === 'remote-defender') {
          Memory.rooms.forEach((room) => {
            if (room.name === Memory.creeps[name].room.name) {
              room.defender = false;
            }
          })
        }
        // Remove the dead remote miner from its room
        if (Memory.creeps[name] && Memory.creeps[name].role === 'remote-miner') {
          Memory.rooms.forEach((room) => {
            _.remove(room.miners, (miner) => miner.name === name);
          })
        }
        // Remove the dead remote courier from its room
        if (Memory.creeps[name] && Memory.creeps[name].role === 'remote-courier') {
          Memory.rooms.forEach((room) => {
            _.remove(room.couriers, (courier) => courier.name === name);
          })
        }

        delete Memory.creeps[name];
        console.log(`💀 RIP ${name} 💀`);
      }
    }
  },

  breedFrom: function (spawn) {
    const energy = spawn.room.energyCapacityAvailable;
    const storage = spawn.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_STORAGE });
    const containers = spawn.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_CONTAINER });
    const sources = spawn.room.find(FIND_SOURCES);

    // Count of all sie creeps.
    const harvesters = _.filter(Game.creeps, c => c.memory.role === 'harvester').length;
    const builders = _.filter(Game.creeps, c => c.memory.role === 'builder').length;
    const upgraders = _.filter(Game.creeps, c => c.memory.role === 'upgrader').length;
    const repairers = _.filter(Game.creeps, c => c.memory.role === 'repairer').length;
    const miners = _.filter(Game.creeps, c => c.memory.role === 'miner');
    const couriers = _.filter(Game.creeps, c => c.memory.role === 'courier');

    let lvl = Math.floor((energy - 300) / 250);
    if (storage.length && storage[0].store[RESOURCE_ENERGY] < 10000) {
      lvl = lvl - 2
    }
    if (lvl > 0 && (miners.length < 1 || couriers.length < 1) && spawn.room.energyAvailable < 500) {
      lvl = 0;
      limits.harvesters = 3;
    }

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
        miners    : sources.length,
        couriers  : 2,
      };
    }

    // Constructing bodies
    const genericBody = [...workParts, ...carryParts, ...moveParts];
    const minerBody = [...Array(5).fill(WORK), ...Array(3).fill(MOVE)];
    const pm = Math.floor(energy / 3 / 50) > 6 ? 6 : Math.floor(energy / 3 / 50);
    const courierBody = [...Array(pm * 2).fill(CARRY), ...Array(pm).fill(MOVE)];
    const reserverBody = [...Array(2).fill(CLAIM), ...Array(2).fill(MOVE)];
    const defenderBody = [
      ...Array(5).fill(TOUGH),
      ...Array(5).fill(MOVE),
      ...Array(4).fill(ATTACK),
      ...Array(6).fill(MOVE),
      ATTACK, HEAL,
    ];
    let rpm = Math.floor((energy - 150) / 3 / 50);
    rpm = rpm < 20 ? rpm : 20;
    const remoteCourierBody = [...Array(rpm * 2).fill(CARRY), ...Array(rpm).fill(MOVE), ...[WORK, MOVE]];

    // Calculating their cost
    // 300 / 300 / 550 / 800  / 1300 / 1800 / 2300 / 5000 / 12000
    // 0   / 1   / 2   / 3    / 4    / 5    / 6    / 7    / 8
    const genericCost = calculateCost(genericBody); // up to 1300
    const minerCost = calculateCost(minerBody); // 650
    const courierCost = calculateCost(courierBody); // 900 // 1250 (remote)
    const reserverCost = calculateCost(reserverBody); // 1300
    const defenderCost = calculateCost(defenderBody); // 1250
    const remoteCourierCost = calculateCost(remoteCourierBody); // 1200 - 3150

    const { spawning } = spawn;
    if (!spawning) {
      const suffix = `(${lvl})-${(new Date()).toLocaleTimeString('hr')}`;
      // Advanced Economy
      if (miners.length < limits.miners && energy >= minerCost) {
        // Figure out what resource/container is empty in the room
        let availableContainers = _.filter(containers, (c) => {
          let available = true;
          miners.forEach(m => m.memory.target && m.memory.target.id === c.id ? available = false : available = true);
          return available;
        });

        // Attach it to the miner
        if (availableContainers.length > 0) {
          spawn.spawnCreep(minerBody, 'M' + suffix, {
            memory: { role: 'miner', level: lvl, target: availableContainers[0] },
          });
        }
      }
      else if (harvesters < limits.harvesters && energy >= genericCost) {
        spawn.spawnCreep(genericBody, 'H' + suffix, { memory: { role: 'harvester', level: lvl } });
      }
      else if (couriers.length < limits.couriers && energy >= courierCost) {
        let availableContainers = _.filter(containers, (c) => {
          let available = true;
          couriers.forEach(m => m.memory.target && m.memory.target.id === c.id ? available = false : available = true);
          return available;
        });

        if (availableContainers.length > 0) {
          spawn.spawnCreep(courierBody, 'C' + suffix, {
            memory: { role: 'courier', level: lvl, target: availableContainers[0] },
          });
        }
      }
      else if (builders < limits.builders && energy >= genericCost) {
        spawn.spawnCreep(genericBody, 'B' + suffix, { memory: { role: 'builder', level: lvl } });
      }
      else if (upgraders < limits.upgraders && energy >= genericCost) {
        spawn.spawnCreep(genericBody, 'U' + suffix, { memory: { role: 'upgrader', level: lvl } });
      }
      else if (repairers < limits.repairers && energy >= genericCost) {
        spawn.spawnCreep(genericBody, 'R' + suffix, { memory: { role: 'repairer', level: lvl } });
      }
      // Remote creeps
      else if (energy >= reserverCost && roomsMissingReserver().length) {
        let hisRoom = roomsMissingReserver()[0];

        if (spawn.spawnCreep(reserverBody, 'ReR' + suffix, {
          memory: {
            role: 'reserver', level: lvl, room: hisRoom,
          },
        }) === OK) {
          hisRoom.reserver = true;
        }
      }
      else if (energy >= defenderCost && roomsMissingDefender().length) {
        let hisRoom = roomsMissingDefender()[0];

        if (spawn.spawnCreep(defenderBody, 'ReD' + suffix, {
          memory: {
            role: 'remote-defender', level: lvl, room: hisRoom,
          },
        }) === OK) {
          hisRoom.defender = true;
        }
      }
      else if (energy >= minerCost + 50 && roomsMissingMiner().length) {
        let hisRoom = roomsMissingMiner()[0];
        const containers = Game.rooms[hisRoom.name].find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_CONTAINER });
        let availableContainers = _.filter(containers, (c) => {
          let available = false;
          miners.forEach(m => m.memory.target && m.memory.target.id === c.id ? null : available = true);
          return available;
        });

        spawn.spawnCreep(minerBody.concat([CARRY]), 'ReM' + suffix, {
          memory: {
            role: 'remote-miner', level: lvl, room: hisRoom, target: availableContainers[0],
          },
        });
      }
      else if (energy >= remoteCourierCost && roomsMissingCourier().length) {
        let hisRoom = roomsMissingCourier()[0];

        spawn.spawnCreep(remoteCourierBody, 'ReC' + suffix, {
          memory: {
            role: 'remote-courier', level: lvl, sourceRoom: hisRoom, depositRoom: Memory.home,
          },
        });
      } else {
        spawn.renewCreep(spawn.pos.findClosestByPath(FIND_MY_CREEPS, {
          filter: (c) => {
            return c.memory.role === 'remote-courier' && c.ticksToLive < 1000
          },
        }));
      }
    } else {
      let spawningCreep = Game.creeps[spawning.name];
      spawn.room.visual.text(`👶 ${_.capitalize(spawningCreep.memory.role)} Level ${lvl}`,
          spawn.pos.x - 3, spawn.pos.y + 2,
          { align: 'left', opacity: 0.8 });

      // Add the spawning remote miner to its room.
      if (spawningCreep.memory.role === 'remote-miner') {
        Memory.rooms.forEach((r) => {
          if (r.name === spawningCreep.memory.room.name && _.findIndex(r.miners, { id: spawningCreep.id }) < 0) {
            r.miners.push(spawningCreep);
          }
        })
      }

      // Add the spawning remote courier to its room.
      if (spawningCreep.memory.role === 'remote-courier') {
        Memory.rooms.forEach((r) => {
          if (r.name === spawningCreep.memory.sourceRoom.name && _.findIndex(r.couriers, { id: spawningCreep.id }) < 0) {
            r.couriers.push(spawningCreep);
          }
        })
      }
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

// Room needs a reserver when:
// 0. Room is not waiting
// 1. Room is for reserving
// 2. Room is safe
// 3. Room does not have a reserver already
// 4. Room is undefined || controller is bellow 2500
let roomsMissingReserver = function () {
  return _.filter(Memory.rooms, (room) => {
    if (room.wait || room.intent !== 'reserve' || !room.isSafe || room.reserver) {
      return false
    }

    const roomObj = Game.rooms[room.name];
    return roomObj === undefined ||
        roomObj.controller.reservation === undefined ||
        roomObj.controller.reservation.ticksToEnd < 2500;
  })
};

// Room needs a defender when:
// 0. It is not waiting
// 1. It is for reserving
// 2. Does not have a defender already
let roomsMissingDefender = function () {
  return _.filter(Memory.rooms, (room) => !room.wait && room.intent === 'reserve' && !room.defender)
};

// Room needs a miner when:
// 0. It is not waiting
// 1. It is for reserving
// 2. It has less miners then sources
// 3. It has more containers then miners
let roomsMissingMiner = function () {
  return _.filter(Memory.rooms, (room) => {
    const roomObj = Game.rooms[room.name];
    if (room.wait || room.intent !== 'reserve' || roomObj === undefined || room.sources <= room.miners.length) {
      return false
    }

    const containersLength = roomObj.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_CONTAINER }).length;

    return containersLength > room.miners
  });
};

// Room needs a courier when:
// 0. It is not waiting
// 1. It is for reserving
// 2. It has less couriers then miners
let roomsMissingCourier = function () {
  return _.filter(Memory.rooms, (room) => {
    if (room.wait || room.intent !== 'reserve') {
      return false
    }

    return room.couriers.length < room.miners.length;
  });
};
