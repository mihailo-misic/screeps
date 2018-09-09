module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-screeps');

  grunt.initConfig({
    pkg    : grunt.file.readJSON('package.json'),
    screeps: {
      options: {
        email   : 'enter_email',
        password: 'enter_password',
        branch  : 'choose_branch',
        ptr     : false,
      },
      dist   : {
        src: ['dist/*.js'],
      },
    },
  });
};
