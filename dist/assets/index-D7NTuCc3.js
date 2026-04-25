var E=Object.defineProperty;var k=(e,t,n)=>t in e?E(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var p=(e,t,n)=>k(e,typeof t!="symbol"?t+"":t,n);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function n(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(a){if(a.ep)return;a.ep=!0;const o=n(a);fetch(a.href,o)}})();const B=[{name:"common",color:"#A0A0A0",emoji:"💎",chance:60,baseIncomeMultiplier:1},{name:"rare",color:"#3B82F6",emoji:"💠",chance:25,baseIncomeMultiplier:2},{name:"epic",color:"#A855F7",emoji:"💜",chance:12,baseIncomeMultiplier:4},{name:"legendary",color:"#F59E0B",emoji:"🌟",chance:3,baseIncomeMultiplier:8}],A={common:["Blobby","Pip","Dot","Zap","Gloop","Nib","Tink","Mop"],rare:["Sparkle","Frosty","Twirl","Glim","Shimmer","Breeze","Nova","Glint"],epic:["Cosmic","Pixel","Prism","Neon","Vortex","Pulse","Flux","Echo"],legendary:["Omni","Transcend","Infinity","Apex","Prime","Ultra","Mega","Hyper"]};function x(){return{currency:100,buddies:[],plots:[{id:"plot-1",level:1,multiplier:1,assignedBuddyId:null},{id:"plot-2",level:1,multiplier:1,assignedBuddyId:null},{id:"plot-3",level:1,multiplier:1,assignedBuddyId:null}],upgrades:[{id:"plot-boost",name:"Plot Power",description:"Increase plot multipliers",cost:50,maxLevel:20,currentLevel:1,effect:{type:"plot_multiplier",value:.5}},{id:"spawn-luck",name:"Lucky Spawn",description:"Better buddy spawn chances",cost:100,maxLevel:10,currentLevel:0,effect:{type:"spawn_chance",value:.05}}],stats:{totalEarned:0,sessionEarned:0,highScore:0},lastUpdate:Date.now(),totalPlayTime:0,buddiesBought:0,moneyEarned:0}}function g(e){let t=0;for(const n of e.buddies)if(n.assignedPlotId){const s=e.plots.find(a=>a.id===n.assignedPlotId);s&&(t+=n.baseIncome*n.level*s.multiplier)}return t}function O(e,t){const n=g(e),s=Math.min(t/1e3,86400);return n*s*.5}function C(e){const t=e.upgrades.find(n=>n.id==="spawn-luck");return t?t.currentLevel*t.effect.value:0}function v(e){return e>=1e9?(e/1e9).toFixed(2)+"B":e>=1e6?(e/1e6).toFixed(2)+"M":e>=1e3?(e/1e3).toFixed(1)+"K":Math.floor(e).toString()}function F(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}function N(e=0){const t=Math.random()*100;let n=0;const s=B.map(a=>({...a,chance:a.chance+(a.name==="legendary"?e*10:a.name==="epic"?e*5:0)}));for(const a of s)if(n+=a.chance,t<n)return a.name;return"common"}function j(e){const t=A[e],n=t[Math.floor(Math.random()*t.length)],s=B.find(a=>a.name===e);return{id:F(),name:n,emoji:s.emoji,rarity:e,baseIncome:1*s.baseIncomeMultiplier,level:1,assignedPlotId:null}}function U(e=0){const t=N(e);return j(t)}function S(e){return Math.floor(10*Math.pow(1.15,e))}function D(e){return Math.floor(5*Math.pow(1.5,e.level-1))}function P(e){return Math.floor(25*Math.pow(1.4,e.level-1))}const $="buy-a-buddy-save",M=1;function f(e){try{const t={version:M,state:e,savedAt:Date.now()};return localStorage.setItem($,JSON.stringify(t)),!0}catch(t){return console.error("Failed to save game:",t),!1}}function G(){try{const e=localStorage.getItem($);if(!e)return null;const t=JSON.parse(e);return t.version!==M?(console.warn("Save version mismatch, starting fresh"),null):t.state}catch(e){return console.error("Failed to load game:",e),null}}class R{constructor(t,n=5e3){p(this,"intervalId",null);p(this,"getState");p(this,"intervalMs");this.getState=t,this.intervalMs=n}start(){this.intervalId||(this.intervalId=window.setInterval(()=>{f(this.getState())},this.intervalMs),document.addEventListener("visibilitychange",()=>{document.hidden&&f(this.getState())}),window.addEventListener("beforeunload",()=>{f(this.getState())}))}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null)}saveNow(){f(this.getState())}}let i,h=null,I=null;const L=new Set;function T(e){L.add(e)}function d(){for(const e of L)e(i)}function _(){const e=G();if(e){const t=Date.now(),n=t-e.lastUpdate;if(n>5e3){const s=O(e,n);e.currency+=s,e.stats.totalEarned+=s}e.lastUpdate=t,i=e}else i=x();return h=new R(()=>i,5e3),h.start(),K(),i}function K(){I||(I=window.setInterval(()=>{const e=g(i)/10;e>0&&(i.currency+=e,i.stats.sessionEarned+=e,i.stats.totalEarned+=e,i.moneyEarned+=e,d())},100))}function m(){return i}function V(){const e=i.buddies.length,t=S(e);if(i.currency<t)return!1;const n=C(i),s=U(n);return i.currency-=t,i.buddies.push(s),i.buddiesBought++,d(),!0}function Y(e,t){const n=i.buddies.find(a=>a.id===e),s=i.plots.find(a=>a.id===t);if(!n||!s)return!1;if(n.assignedPlotId){const a=i.plots.find(o=>o.id===n.assignedPlotId);a&&(a.assignedBuddyId=null)}if(s.assignedBuddyId){const a=i.buddies.find(o=>o.id===s.assignedBuddyId);a&&(a.assignedPlotId=null)}return n.assignedPlotId=t,s.assignedBuddyId=e,d(),!0}function H(e){const t=i.buddies.find(s=>s.id===e);if(!t||!t.assignedPlotId)return!1;const n=i.plots.find(s=>s.id===t.assignedPlotId);return n&&(n.assignedBuddyId=null),t.assignedPlotId=null,d(),!0}function J(e){const t=i.buddies.find(s=>s.id===e);if(!t)return!1;const n=D(t);return i.currency<n?!1:(i.currency-=n,t.level++,d(),!0)}function W(e){const t=i.plots.find(s=>s.id===e);if(!t)return!1;const n=P(t);return i.currency<n?!1:(i.currency-=n,t.level++,t.multiplier=1+(t.level-1)*.5,d(),!0)}function q(e){const t=i.upgrades.find(s=>s.id===e);if(!t||t.currentLevel>=t.maxLevel)return!1;const n=t.cost*t.currentLevel;return i.currency<n?!1:(i.currency-=n,t.currentLevel++,d(),!0)}let l=null,y=null;function z(e){if(l=document.getElementById(e),!l){console.error("Game container not found:",e);return}const t=_();T(u),u(t),l.addEventListener("click",ae),document.addEventListener("keydown",oe)}function u(e){l&&(l.innerHTML=`
    <div class="game-wrapper">
      ${Z(e)}
      ${Q(e)}
      ${ne()}
    </div>
    ${y?se():""}
  `)}function Z(e){const t=g(e);return`
    <div class="top-bar">
      <div class="title-section">
        <h1 class="game-title">Buy a Buddy</h1>
        <span class="version">v1.0</span>
      </div>
      <div class="currency-section">
        <div class="currency-display">
          <span class="coin-icon">🪙</span>
          <span class="currency-amount">${v(e.currency)}</span>
        </div>
        <div class="income-badge">
          📈 ${v(t)}/s
        </div>
      </div>
    </div>
  `}function Q(e){return`
    <div class="main-area">
      ${X(e)}
      ${te(e)}
    </div>
  `}function X(e){return`
    <div class="plots-section">
      <h2 class="section-title">🗺️ Your Plots</h2>
      <div class="plots-grid">
        ${e.plots.map(t=>{const n=t.assignedBuddyId?e.buddies.find(s=>s.id===t.assignedBuddyId):void 0;return ee(t,n)}).join("")}
      </div>
    </div>
  `}function ee(e,t){const n=P(e),s=t?(t.baseIncome*t.level*e.multiplier).toFixed(1):"0";return`
    <div class="plot-card ${t?"occupied":"empty"}" data-plot-id="${e.id}">
      <div class="plot-header">
        <span class="plot-number">Plot ${e.id.split("-")[1]}</span>
        <span class="plot-level">Lv ${e.level}</span>
      </div>
      <div class="plot-content">
        ${t?`
          <div class="buddy-display ${t.rarity}">
            <span class="buddy-emoji">${t.emoji}</span>
            <span class="buddy-name">${t.name}</span>
            <span class="buddy-level">Lv ${t.level}</span>
          </div>
        `:`
          <div class="empty-plot-content">
            <span class="empty-icon">🏝️</span>
            <span class="empty-text">Empty Plot</span>
          </div>
        `}
      </div>
      <div class="plot-stats">
        <span class="income-stat">💰 ${s}/s</span>
        <span class="multiplier-stat">×${e.multiplier.toFixed(1)}</span>
      </div>
      <div class="plot-actions">
        ${t?`
          <button class="btn btn-unassign" data-action="unassign" data-buddy-id="${t.id}">
            ↩️ Unassign
          </button>
        `:`
          <button class="btn btn-assign" data-action="open-inventory">
            📍 Assign Buddy
          </button>
        `}
        <button class="btn btn-upgrade ${t?"":"disabled"}" 
                data-action="upgrade-plot" 
                data-plot-id="${e.id}"
                ${t?"":"disabled"}>
          ⬆️ ${v(n)}
        </button>
      </div>
    </div>
  `}function te(e){const t=S(e.buddies.length),n=e.currency>=t,s=e.buddies.filter(a=>!a.assignedPlotId).length;return`
    <div class="spawner-section">
      <h2 class="section-title">🎁 Buddy Spawner</h2>
      <div class="spawner-card">
        <div class="spawner-header">
          <span class="spawner-icon">🎁</span>
          <span class="spawner-title">Roll for a Buddy!</span>
        </div>
        <div class="spawner-rates">
          <span class="rate common">💎 60%</span>
          <span class="rate rare">💠 25%</span>
          <span class="rate epic">💜 12%</span>
          <span class="rate legendary">🌟 3%</span>
        </div>
        <button class="btn btn-spawn ${n?"":"disabled"}" 
                data-action="buy-buddy"
                ${n?"":"disabled"}>
          <span class="spawn-text">🎲 Roll Buddy</span>
          <span class="spawn-cost">🪙 ${v(t)}</span>
        </button>
        ${s>0?`
          <div class="unassigned-badge">
            🎒 ${s} unassigned
          </div>
        `:""}
      </div>
    </div>
  `}function ne(){return`
    <div class="bottom-nav">
      <button class="nav-btn" data-action="open-inventory">
        🎒 Inventory
      </button>
      <button class="nav-btn" data-action="open-shop">
        🛒 Upgrades
      </button>
      <button class="nav-btn" data-action="open-stats">
        📊 Stats
      </button>
      <button class="nav-btn" data-action="open-help">
        ❓ Help
      </button>
    </div>
  `}function se(){return'<div class="modal-overlay" data-action="close-modal"></div>'}function ae(e){const t=e.target;if(!t.dataset.action){const s=t.closest("[data-action]");s&&w(s);return}w(t)}function w(e){switch(e.dataset.action){case"buy-buddy":V();break;case"assign":c("inventory");break;case"unassign":const n=e.dataset.buddyId;n&&H(n);break;case"upgrade-plot":const s=e.dataset.plotId;s&&W(s);break;case"upgrade-buddy":const a=e.dataset.buddyId;a&&J(a);break;case"purchase-upgrade":const o=e.dataset.upgradeId;o&&q(o);break;case"open-inventory":c("inventory");break;case"open-shop":c("shop");break;case"open-stats":c("stats");break;case"open-help":c("help");break;case"close-modal":b();break;case"assign-buddy-select":const r=e.dataset.buddyId;r&&ie(r);break}}function ie(e){const n=m().plots.filter(o=>!o.assignedBuddyId);if(n.length===0){alert("No empty plots available!");return}const s=n.map((o,r)=>`Plot ${r+1} (×${o.multiplier})`).join(`
`),a=prompt(`Select a plot:
${s}

Enter plot number:`);if(a){const o=parseInt(a)-1;o>=0&&o<n.length&&Y(e,n[o].id)}b()}function c(e){y=e,u(m())}function b(){y=null,u(m())}function oe(e){e.key==="Escape"&&b()}function re(){u(m())}document.addEventListener("DOMContentLoaded",()=>{z("game"),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})})});document.addEventListener("contextmenu",e=>{e.preventDefault()});document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&re()});
