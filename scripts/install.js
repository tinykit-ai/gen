const Installer = require('../src/installer');

const installer = new Installer();
installer.install().catch(console.error);