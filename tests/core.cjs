const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const element=()=>({addEventListener(){},setAttribute(){},classList:{remove(){}},querySelectorAll(){return[]},style:{},close(){this.open=false}});
const elements=new Map();const doc={querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll(){return[]},body:{classList:{remove(){}}}};
const old={name:'Barbería',logo:'',hours:{open:'10:00',close:'19:00',closed:false},overrides:{},blocks:[],appointments:[{id:'old',name:'Cliente conocido',phone:'529991234567',date:'2099-01-01',time:'10:00',status:'confirmed'}]};
const context={console,Date,JSON,Math,Number,String,Array,Error,Set,structuredClone,crypto:crypto.webcrypto,document:doc,localStorage:{getItem:()=>JSON.stringify(old),setItem(){}},window:{addEventListener(){}},location:{hash:''},setInterval(){},setTimeout(){},clearTimeout(){},AppointmentAlerts:{observe(){}}};
vm.createContext(context);let source=fs.readFileSync(__dirname+'/../app.js','utf8').replace('},30000);render();','},30000);');vm.runInContext(source,context);
vm.runInContext(`
if(state.clients.length!==1||state.clients[0].phone!=='9991234567'||state.appointments[0].clientId!==state.clients[0].id)throw Error('migration');
if(normalizePhone('999 123 4567')!=='9991234567')throw Error('phone');
if(!busy('2099-01-01','10:00')||busy('2099-01-01','11:00'))throw Error('availability');
if(!tabs('notificaciones').includes('aria-current="page"')||!tabs('clientes').includes('Clientes'))throw Error('navigation');
const candidates=cleanupCandidates({appointments:[{id:'old',date:'2024-01-01',status:'completed'},{id:'rejected',date:'2026-08-01',status:'rejected'},{id:'kept',date:'2026-10-01',status:'confirmed'}],blocks:[{id:'b1',date:'2026-01-01'},{id:'b2',date:'2026-11-20'}]},new Date('2026-11-22T12:00:00'));
if(candidates.appointments.join(',')!=='old,rejected'||candidates.blocks.join(',')!=='b1')throw Error('retention');
`,context);
assert.ok(!source.includes('https://wa.me/${a.phone}'));
assert.ok(source.includes('https://wa.me/52${a.phone}'));
// Real notification module with browser boundaries mocked: no request on load,
// no replay for existing requests, no alert on the public view, one alert for new pending.
let shown=0,permissionRequests=0;
const nc={window:{},isSecureContext:true,Set,Promise,URL,document:{baseURI:'https://example.test/barberia/'},localStorage:{getItem:()=>JSON.stringify({enabled:true})},navigator:{serviceWorker:{register:async()=>({}),ready:Promise.resolve({showNotification:async()=>{shown++}})}},Notification:{permission:'granted',requestPermission:async()=>{permissionRequests++;return'granted'}}};nc.window.Notification=nc.Notification;vm.createContext(nc);vm.runInContext(fs.readFileSync(__dirname+'/../notifications.js','utf8'),nc);
(async()=>{const alerts=nc.window.AppointmentAlerts;alerts.observe([{id:'a',status:'pending'}],true);alerts.observe([{id:'a',status:'pending'},{id:'b',status:'pending'}],false);alerts.observe([{id:'a',status:'pending'},{id:'b',status:'pending'},{id:'c',status:'pending'}],true);await new Promise(r=>setTimeout(r,20));assert.equal(shown,1);assert.equal(permissionRequests,0);console.log('PASS migration, Mexico phone, availability, navigation, retention, notification opt-in and deduplication.');})().catch(e=>{console.error(e);process.exitCode=1});
