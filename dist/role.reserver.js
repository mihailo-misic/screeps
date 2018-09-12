module.exports = {
  run: function (creep) {
    if (creep.room.name === creep.memory.room.name) {
      if (creep.reserveController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { reusePath: 5, visualizePathStyle: { stroke: 'cyan' } });
      }
    } else {
      creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.room.name)), {
        reusePath: 5, visualizePathStyle: { stroke: 'cyan' },
      })
    }
  },
};
