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
            _.remove(room.miners, (miner) => miner.name === name)
          })
        }
        // Remove the dead remote courier from its room
        if (Memory.creeps[name] && Memory.creeps[name].role === 'remote-courier') {
          Memory.rooms.forEach((room) => {
            if (room.name === Memory.creeps[name].sourceRoom.name) {
              room.courier = false;
            }
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
    let lvl = Math.floor((energy - 300) / 250);
    if (!storage.length && storage[0].store[RESOURCE_ENERGY] < 1000) {
      lvl = lvl > 4 ? 4 : lvl;
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
        miners    : containers.length,
        couriers  : 2,
      };
    }

    // Constructing bodies
    const genericBody = [...workParts, ...carryParts, ...moveParts];
    const minerBody = [...Array(5).fill(WORK), ...Array(3).fill(MOVE)];
    const pm = Math.floor(energy / 3 / 50) > 6 ? 6 : Math.floor(energy / 3 / 50);
    const courierBody = [...Array(pm * 2).fill(CARRY), ...Array(pm).fill(MOVE)];
    const reserverBody = [...Array(2).fill(CLAIM), ...Array(2).fill(MOVE)];
    const defenderBody = [...Array(5).fill(TOUGH), ...Array(5).fill(ATTACK), HEAL, ...Array(11).fill(MOVE)];
    const rpm = Math.floor((energy - 150) / 3 / 50);
    const remoteCourierBody = [...Array(rpm * 2).fill(CARRY), ...Array(rpm).fill(MOVE), ...[WORK, MOVE]];
    // Calculating their cost
    // 300 / 300 / 550 / 800  / 1300 / 1800 / 2300 / 5000 / 12000
    // 0   / 1   / 2   / 3    / 4    / 5    / 6    / 7    / 8
    const genericCost = calculateCost(genericBody); // up to 1300
    const minerCost = calculateCost(minerBody); // 650
    const courierCost = calculateCost(courierBody); // 900 // 1250 (remote)
    const reserverCost = calculateCost(reserverBody); // 1300
    const defenderCost = calculateCost(defenderBody); // 1250
    const remoteCourierCost = calculateCost(remoteCourierBody);

    // Count of all sie creeps.
    const harvesters = _.filter(Game.creeps, c => c.memory.role === 'harvester').length;
    const builders = _.filter(Game.creeps, c => c.memory.role === 'builder').length;
    const upgraders = _.filter(Game.creeps, c => c.memory.role === 'upgrader').length;
    const repairers = _.filter(Game.creeps, c => c.memory.role === 'repairer').length;
    const miners = _.filter(Game.creeps, c => c.memory.role === 'miner');
    const couriers = _.filter(Game.creeps, c => c.memory.role === 'courier').length;

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
      else if (couriers < limits.couriers && energy >= courierCost) {
        spawn.spawnCreep(courierBody, 'C' + suffix, { memory: { role: 'courier', level: lvl } });
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
      else if (true && roomsMissingA('reserver').length && energy >= reserverCost) {
        let hisRoom = roomsMissingA('reserver')[0];
        if (spawn.spawnCreep(reserverBody, 'ReR' + suffix, {
          memory: {
            role: 'reserver', level: lvl, room: hisRoom,
          },
        }) === OK) {
          hisRoom.reserver = true;
        }
      }
      else if (true && roomsMissingA('defender').length && energy >= defenderCost) {
        let hisRoom = roomsMissingA('defender')[0];
        if (spawn.spawnCreep(defenderBody, 'ReD' + suffix, {
          memory: {
            role: 'remote-defender', level: lvl, room: hisRoom,
          },
        }) === OK) {
          hisRoom.defender = true;
        }
      }
      else if (true && roomMissingMiners() && energy >= minerCost + 50) {
        let room = roomMissingMiners();
        const containers = room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_CONTAINER });
        let availableContainers = _.filter(containers, (c) => {
          let available = false;
          miners.forEach(m => m.memory.target && m.memory.target.id === c.id ? null : available = true);
          return available;
        });

        spawn.spawnCreep(minerBody.concat([CARRY]), 'ReM' + suffix, {
          memory: {
            role: 'remote-miner', level: lvl, room, target: availableContainers[0],
          },
        });
      }
      else if (true && roomsMissingA('courier').length && energy >= remoteCourierCost) {
        let hisRoom = roomsMissingA('courier')[0];
        if (spawn.spawnCreep(remoteCourierBody, 'ReC' + suffix, {
          memory: {
            role: 'remote-courier', level: lvl, sourceRoom: hisRoom, depositRoom: Memory.home,
          },
        }) === OK) {
          hisRoom.courier = true;
        }
      }
    } else {
      let spawningCreep = Game.creeps[spawning.name];
      spawn.room.visual.text(`👶 ${_.capitalize(spawningCreep.memory.role)} Level ${lvl}`,
          spawn.pos.x - 3, spawn.pos.y + 2,
          { align: 'left', opacity: 0.8 });

      if (spawningCreep.memory.role === 'remote-miner') {
        Memory.rooms.forEach((r) => {
          if (r.name === spawningCreep.memory.room.name && _.findIndex(r.miners, { id: spawningCreep.id }) < 0) {
            r.miners.push(spawningCreep);
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

let roomsMissingA = function (role) {
  return _.filter(Memory.rooms, (room) => !room.wait && !room[role])
};

let roomMissingMiners = function () {
  let missing = false;
  Memory.rooms.forEach(room => {
    if (!room.wait && room.miners.length < room.sources) {
      missing = Game.rooms[room.name];
    }
  });

  return missing
};
