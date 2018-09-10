// Instructs the creep to grab energy from the closest source.
Creep.prototype.getEnergy = function () {
  let source;

  if (this.room.storage.store[RESOURCE_ENERGY] > 0) {
    source = this.room.storage
  }

  if (source) {
    if (this.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      this.moveTo(source, { reusePath: 1, visualizePathStyle: { stroke: 'yellow' } });
    } else {
      this.memory.working = true;
    }
  } else {
    source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (!source && this.carry.energy !== 0) {
      this.memory.working = true;
    }
    if (this.harvest(source) === ERR_NOT_IN_RANGE) {
      this.moveTo(source, { reusePath: 1, visualizePathStyle: { stroke: 'yellow' } });
    }
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
