module.exports = {
  run: function (creep) {
    const index = _.filter(Game.creeps, c => c.memory.role === 'reserver').indexOf(creep);
    const room = Memory.roomsToReserve[index];

    if (creep.room.name !== room.name) {
      creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(room.name)), {
        reusePath: 5, visualizePathStyle: { stroke: 'cyan' },
      })
    } else {
      if (creep.reserveController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { reusePath: 5, visualizePathStyle: { stroke: 'cyan' } });
      }
    }
  },
};
