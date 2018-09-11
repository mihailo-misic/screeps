module.exports = {
  run: function (creep) {
    // Glitch mine
    const index = _.filter(Game.creeps, c => c.memory.role === 'miner').indexOf(creep);
    const container = creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER })[index];

    if (creep.harvest(container.pos.findClosestByPath(FIND_SOURCES)) === ERR_NOT_IN_RANGE) {
      creep.moveTo(container, { reusePath: 1, visualizePathStyle: { stroke: 'yellow' } });
    }
  },
};

// WIP
// module.exports = {
//   run: function (creep) {
//     // Glitch mine
//     const container = creep.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.id === creep.target.id });
//     console.log(container.id);
//
//     if (container && creep.harvest(container.pos.findClosestByPath(FIND_SOURCES)) === ERR_NOT_IN_RANGE) {
//       creep.moveTo(container, { reusePath: 5, visualizePathStyle: { stroke: 'yellow' } });
//     }
//   },
// };
