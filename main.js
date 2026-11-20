import { mountDragon } from './dragon.js';
const host=document.getElementById('dragon-stage');
try { mountDragon(host); }
catch(err) { console.error('Could not initialize dragon:',err); const msg=host.querySelector('.dragon-error'); if(msg)msg.hidden=false; }
