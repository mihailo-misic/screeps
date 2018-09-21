// Upgrader: Upgrades
module.exports = {
  run: function (creep) {
    creep.checkEnergyOr('⚡');

    if (creep.memory.working) {
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { reusePath: 20, visualizePathStyle: { stroke: 'cyan' } });
      }
    } else {
      creep.getEnergy();
    }
  },
};
