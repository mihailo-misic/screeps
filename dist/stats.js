// Stats module displays and handles general stats.
module.exports = {
  // Display the energy status right below the rooms center.
  energyStatus: function () {
    const myRoom = Game.spawns['Spawn1'].room;
    const color = myRoom.energyAvailable >= myRoom.energyCapacityAvailable - 100 ? 'green' : 'orange';
    myRoom.visual.text(`${myRoom.energyAvailable} / ${myRoom.energyCapacityAvailable}`, 32, 31, { color, font: 0.8 })
  },
};
