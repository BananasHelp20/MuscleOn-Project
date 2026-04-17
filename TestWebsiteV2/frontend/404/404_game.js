const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 260;

let gameSpeed = 6;
const gravity = 0.62;
let score = 0;
let highScore = 0;
let gameOver = false;
let started = false;
let frame = 0;
let selectedCharacter = 'duck';
let firstRun = true;

const minGap = 250;
const maxGap = 560;
const minSafeGap = 235;
let nextSpawnX = canvas.width + 320;

const player = { x:70, y:176, w:64, h:46, vy:0, jumping:false };
const obstacles = [];

const errorCodes = ['404','500','403','401','502','408','429', "400", "402", "405", "410", "418", "900"];
const successCodes = ['200','201','202','204', "203", "205", "207", "208", "226"];

function rand(min,max){ return Math.random()*(max-min)+min; }

function resetGame(){
  score = 0;
  gameSpeed = 6;
  gameOver = false;
  started = false;
  frame = 0;
  obstacles.length = 0;
  nextSpawnX = canvas.width + 320;
  player.y = 176;
  player.vy = 0;
  player.jumping = false;
}

function jump(){
  if(!player.jumping && !gameOver){
    player.vy = -12.4;
    player.jumping = true;
    started = true;
    firstRun = false;
  }
}

function scheduleNext(lastX){ nextSpawnX = lastX + rand(minGap,maxGap); }

function spawnObstacle(){
  const isSuccess = Math.random() < 0.14;
  const list = isSuccess ? successCodes : errorCodes;
  const code = list[Math.floor(Math.random()*list.length)];

  const w = isSuccess ? 42 : 64;
  const h = isSuccess ? 39 : 58;
  const x = Math.max(canvas.width, nextSpawnX);
  const y = isSuccess ? 187 : 168;

  if(obstacles.length){
    const prev = obstacles[obstacles.length-1];
    if(x - prev.x < minSafeGap) return;
  }

  obstacles.push({x,y,w,h,code,isSuccess});
  scheduleNext(x);
}

function updatePlayer(){
  player.vy += gravity;
  player.y += player.vy;
  if(player.y >= 176){
    player.y = 176;
    player.vy = 0;
    player.jumping = false;
  }
}

function updateObstacles(){
  if(obstacles.length === 0 || obstacles[obstacles.length-1].x <= canvas.width - 40){
    if(nextSpawnX <= canvas.width) spawnObstacle();
  }

  for(let i=obstacles.length-1;i>=0;i--){
    const o = obstacles[i];
    o.x -= gameSpeed;

    if(o.x + o.w < 0){
      obstacles.splice(i,1);
      if(!o.isSuccess) score++;
      highScore = Math.max(highScore, score);
      if(score > 0 && score % 5 === 0) gameSpeed += 0.35;
      continue;
    }

    const hit = player.x+10 < o.x+o.w && player.x+player.w-12 > o.x && player.y+8 < o.y+o.h && player.y+player.h-6 > o.y;

    if(hit){
      if(o.isSuccess){
        score += 5;
        highScore = Math.max(highScore, score);
        obstacles.splice(i,1);
      } else {
        gameOver = true;
      }
    }
  }

  nextSpawnX -= gameSpeed;
}

function update(){
  frame++;
  if(!started || gameOver) return;
  updatePlayer();
  updateObstacles();
}

function drawGround(){
  ctx.strokeStyle='#8d8d8d';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(0,230); ctx.lineTo(canvas.width,230); ctx.stroke();
  for(let i=0;i<canvas.width;i+=24){
    ctx.beginPath(); ctx.moveTo(i,236); ctx.lineTo(i+12,236); ctx.stroke();
  }
}

function drawDuck(){
  const x=player.x,y=player.y, flap=Math.sin(frame*0.35), leg=Math.sin(frame*0.45)*3;
  ctx.fillStyle='#ffd54f';
  ctx.beginPath(); ctx.ellipse(x+28,y+27,26,18,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+49,y+15,13,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff59d';
  ctx.beginPath(); ctx.ellipse(x+24,y+28,14,10,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#e0b000'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(x+14,y+20); ctx.lineTo(x+2,y+11+flap); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+18,y+24); ctx.lineTo(x+5,y+23+flap); ctx.stroke();
  ctx.fillStyle='#ff9800';
  ctx.beginPath(); ctx.moveTo(x+58,y+15); ctx.lineTo(x+74,y+20); ctx.lineTo(x+58,y+25); ctx.fill();
  ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+51,y+13,2.2,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#ff9800';
  ctx.beginPath(); ctx.moveTo(x+22,y+43); ctx.lineTo(x+20,y+52+leg); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+34,y+43); ctx.lineTo(x+36,y+52-leg); ctx.stroke();
}

// IMPROVED FOX (more detailed, bushy tail, clearer face)
function drawFox(){
  const x=player.x,y=player.y, leg=Math.sin(frame*0.45)*3;

  // body (more fox-like proportions)
  ctx.fillStyle='#d35400';
  ctx.beginPath();
  ctx.ellipse(x+30,y+30,29,18,0,0,Math.PI*2);
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.ellipse(x+56,y+18,17,14,0,0,Math.PI*2);
  ctx.fill();

  // white chest / snout blend
  ctx.fillStyle='#ffe0b2';
  ctx.beginPath();
  ctx.ellipse(x+62,y+24,11,8,0,0,Math.PI*2);
  ctx.fill();

  // ears (outer)
  ctx.fillStyle='#bf360c';
  ctx.beginPath();
  ctx.moveTo(x+50,y+8);
  ctx.lineTo(x+54,y-10);
  ctx.lineTo(x+60,y+8);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x+60,y+8);
  ctx.lineTo(x+64,y-8);
  ctx.lineTo(x+70,y+10);
  ctx.fill();

  // inner ears
  ctx.fillStyle='#ffccbc';
  ctx.beginPath(); ctx.ellipse(x+55,y+2,3,6,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+65,y+2,3,6,0,0,Math.PI*2); ctx.fill();

  // eyes
  ctx.fillStyle='#111';
  ctx.beginPath(); ctx.arc(x+58,y+16,2,0,Math.PI*2); ctx.fill();

  // nose
  ctx.fillRect(x+70,y+20,3,3);

  // bushy layered tail
  ctx.fillStyle='#e67e22';
  ctx.beginPath();
  ctx.moveTo(x+10,y+28);
  ctx.quadraticCurveTo(x-20,y+10,x-10,y+40);
  ctx.quadraticCurveTo(x+5,y+55,x+15,y+35);
  ctx.fill();

  // legs
  ctx.strokeStyle='#bf360c';
  ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(x+20,y+44); ctx.lineTo(x+20,y+54+leg); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+38,y+44); ctx.lineTo(x+38,y+54-leg); ctx.stroke();
}

function drawCharacter(){
  if(selectedCharacter==='fox') return drawFox();
  drawDuck();
}

function drawObstacle(o){
  const {x,y,w,h,code,isSuccess}=o;

  if(isSuccess){
    ctx.fillStyle='#1b5e20';
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#43a047';
    ctx.fillRect(x+5,y+14,w-10,h-18);
    ctx.strokeStyle='#0d3d12';
    ctx.strokeRect(x,y,w,h);
    ctx.fillStyle='#fff';
    ctx.font='bold 14px monospace';
    ctx.fillText(code,x+6,y+25);
    return;
  }

  ctx.fillStyle='#b71c1c';
  ctx.fillRect(x,y,w,h);
  ctx.fillStyle='#d32f2f';
  ctx.fillRect(x+4,y+4,w-8,10);
  ctx.fillStyle='#8e0000';
  ctx.fillRect(x+6,y+18,w-12,h-24);
  ctx.strokeStyle='#5f0000';
  ctx.strokeRect(x,y,w,h);
  ctx.fillStyle='#fff';
  ctx.font='bold 20px monospace';
  ctx.fillText(code,x+9,y+35);
}

function drawText(){
  ctx.fillStyle='#333';
  ctx.font='18px Arial';
  ctx.fillText(`Score: ${score}`,18,28);
  ctx.fillText(`High: ${highScore}`,130,28);

  if(firstRun && !started){
    ctx.font='28px Arial';
    ctx.fillText('404 - Page Not Found',270,72);
    ctx.font='18px Arial';
    ctx.fillText('Choose Character: [1] Duck   [2] Fox',240,108);
    ctx.fillText(`Current: ${selectedCharacter.toUpperCase()}`,320,136);
    ctx.fillText('SPACE / ↑ to Start',330,164);
    return;
  }

  if(!started){
    ctx.font='28px Arial';
    ctx.fillText('404 - Page Not Found',270,92);
    ctx.font='18px Arial';
    ctx.fillText('SPACE / ↑ to Start',330,124);
  }


  if(gameOver){
    ctx.font='28px Arial';
    ctx.fillText('Game Over',355,104);
    ctx.font='18px Arial';
    ctx.fillText('Press SPACE or ↑ to Restart',300,134);
  }
}

function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawGround();
  drawCharacter();
  obstacles.forEach(drawObstacle);
  drawText();
}

function loop(){ update(); render(); requestAnimationFrame(loop); }

document.addEventListener('keydown', e => {
  if(firstRun && !started){
    if(e.key==='1') selectedCharacter='duck';
    if(e.key==='2') selectedCharacter='fox';
  }

  if(e.code==='Space' || e.code==='ArrowUp'){
    e.preventDefault();
    if(gameOver) resetGame();
    jump();
  }
});

loop();
