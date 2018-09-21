module.exports = {
  run: function (creep) {
    if (creep.room.name === creep.memory.room.name) {
      // Look for enemies and FIGHT!
      const closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile) {
        _.find(Memory.rooms, r => r.name === creep.memory.room.name).isSafe = false;

        if (creep.attack(closestHostile) === ERR_NOT_IN_RANGE) {
          creep.moveTo(closestHostile, { reusePath: 20, visualizePathStyle: { stroke: 'tomato' } });
        }
      } else {
        if (!_.find(Memory.rooms, r => r.name === creep.memory.room.name).isSafe) {
          _.find(Memory.rooms, r => r.name === creep.room.name).isSafe = true;
        }

        // Look for injured and heal them
        const injuredCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS,
            { filter: (s) => s.hits < s.hitsMax },
        );
        if (injuredCreep) {
          if (creep.heal(injuredCreep) === ERR_NOT_IN_RANGE) {
            creep.moveTo(injuredCreep, { reusePath: 20, visualizePathStyle: { stroke: 'lime' } })
          }
        } else {
          // Go to controller
          creep.moveTo(creep.room.controller, { reusePath: 20, visualizePathStyle: { stroke: 'cyan' } })
        }
      }
    } else {
      creep.goToRoom(creep.memory.room)
    }
  },
};
