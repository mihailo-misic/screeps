// Instructs the creep to grab energy from the closest source.
Creep.prototype.getEnergy = function (room = Memory.home) {
  if (this.room.name === room.name) {
    let source;

    if (this.room.storage && this.room.storage.store[RESOURCE_ENERGY] > 0) {
      source = this.room.storage
    }

    if (source) {
      if (this.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        this.moveTo(source, { reusePath: 5, visualizePathStyle: { stroke: 'yellow' } });
      } else {
        this.memory.working = true;
      }
    } else {
      source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (!source && this.carry.energy !== 0) {
        this.memory.working = true;
      }
      if (this.harvest(source) === ERR_NOT_IN_RANGE) {
        this.moveTo(source, { reusePath: 5, visualizePathStyle: { stroke: 'yellow' } });
      }
    }
  } else {
    // If you're not in the room with sources go to it.
    this.moveTo(this.room.find(this.room.findExitTo(room.name))[5], {
      reusePath: 5, visualizePathStyle: { stroke: 'cyan' },
    });
  }
};

// Check if the creep has energy,
// and decide to either harvest or work.
Creep.prototype.checkEnergyOr = function (msg) {
  if (this.memory.working && this.carry.energy === 0) {
    this.memory.working = false;
    this.say('⛏');
  } else if (!this.memory.working && this.carry.energy === this.carryCapacity) {
    this.memory.working = true;
    this.say(msg);
  }

  // Pick up energy along the way.
  const droppedEnergy = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
  if (droppedEnergy) {
    this.pickup(droppedEnergy)
  }
};
