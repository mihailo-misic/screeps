module.exports = {
  run: function (creep) {
    if (creep.room.name === creep.memory.room.name) {
      // Look for enemies and FIGHT!
      const closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile) {
        if (creep.attack(closestHostile) === ERR_NOT_IN_RANGE) {
          creep.moveTo(closestHostile, { reusePath: 10, visualizePathStyle: { stroke: 'tomato' } });
        }
      } else {
        // Look for injured and heal them
        const injuredCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS,
            { filter: (s) => s.hits < s.hitsMax },
        );
        if (injuredCreep) {
          if (creep.heal(injuredCreep) === ERR_NOT_IN_RANGE) {
            creep.moveTo(injuredCreep, { reusePath: 10, visualizePathStyle: { stroke: 'lime' } })
          }
        } else {
          // Go to controller
          creep.moveTo(creep.room.controller, { reusePath: 10, visualizePathStyle: { stroke: 'cyan' } })
        }
      }
    } else {
      creep.goToRoom(creep.memory.room)
    }
  },
};
