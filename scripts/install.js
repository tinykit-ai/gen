const Installer = require('../src/configure');

const installer = new Installer();
installer.install().catch(console.error);