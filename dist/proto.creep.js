// Instructs the creep to grab energy from the closest source.
Creep.prototype.getEnergy = function () {
  const source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  if (this.harvest(source) === ERR_NOT_IN_RANGE) {
    this.moveTo(source, { reusePath: 1, visualizePathStyle: { stroke: 'yellow' } });
  }
};

// Check if the creep has energy,
// and decide to either harvest or work.
Creep.prototype.checkEnergyOr = function (msg) {
  if (this.memory.working && this.carry.energy === 0) {
    this.memory.working = false;
    this.say('⛏️ Harvest');
  } else if (!this.memory.working && this.carry.energy === this.carryCapacity) {
    this.memory.working = true;
    this.say(msg);
  }
};
