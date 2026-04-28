// ===== CONFIG =====
const CONFIG = {
  birthday: new Date(2012, 0, 19), // 2012/01/19
  height: 143.5,  // cm
  weight: 44.6,   // kg
};

// ===== AGE CALCULATION =====
function calcAge(birthday) {
  const now = new Date();
  let years = now.getFullYear() - birthday.getFullYear();
  let months = now.getMonth() - birthday.getMonth();
  let days = now.getDate() - birthday.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

// ===== BMI & SPEC CALCULATIONS =====
function calcBMI(weight, heightCm) {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

function getBMIStatus(bmi) {
  if (bmi < 18.5) return { label: 'UNDER', color: '#00f0ff' };
  if (bmi < 25) return { label: 'NORMAL', color: '#00ff87' };
  if (bmi < 30) return { label: 'OVER', color: '#ffe156' };
  return { label: 'OBESE', color: '#ff4757' };
}

function calcRohrer(weight, heightCm) {
  // Rohrer Index = weight(kg) / height(cm)^3 * 10^7
  return (weight / Math.pow(heightCm, 3)) * 1e7;
}

function calcBSA(weight, heightCm) {
  // Du Bois formula: BSA = 0.007184 * W^0.425 * H^0.725
  return 0.007184 * Math.pow(weight, 0.425) * Math.pow(heightCm, 0.725);
}

function calcBMR(weight, heightCm, age) {
  // Harris-Benedict (for general use, no gender specified)
  // Using average: (male + female) / 2 approximation
  // Male: 88.362 + 13.397*W + 4.799*H - 5.677*A
  // Female: 447.593 + 9.247*W + 3.098*H - 4.330*A
  const male = 88.362 + 13.397 * weight + 4.799 * heightCm - 5.677 * age;
  const female = 447.593 + 9.247 * weight + 3.098 * heightCm - 4.330 * age;
  return (male + female) / 2;
}

// ===== UPDATE DATA =====
function updateProfileData() {
  const age = calcAge(CONFIG.birthday);
  const bmi = calcBMI(CONFIG.weight, CONFIG.height);
  const bmiStatus = getBMIStatus(bmi);
  const rohrer = calcRohrer(CONFIG.weight, CONFIG.height);
  const bsa = calcBSA(CONFIG.weight, CONFIG.height);
  const bmr = calcBMR(CONFIG.weight, CONFIG.height, age.years);
  const specDiff = CONFIG.height - CONFIG.weight;

  // Age
  document.getElementById('age-value').textContent =
    `${age.years}歳${age.months}ヶ月${age.days}日`;

  // BMI
  document.getElementById('bmi-value').textContent = bmi.toFixed(2);
  const bmiBar = document.getElementById('bmi-bar');
  const bmiPercent = Math.min((bmi / 35) * 100, 100);
  bmiBar.style.width = bmiPercent + '%';

  // BMI Status
  const statusEl = document.getElementById('bmi-status');
  statusEl.textContent = bmiStatus.label;
  statusEl.style.color = bmiStatus.color;
  statusEl.style.textShadow = `0 0 8px ${bmiStatus.color}`;

  // Spec Table
  document.getElementById('rohrer-value').textContent = rohrer.toFixed(2);
  document.getElementById('bsa-value').textContent = bsa.toFixed(4) + ' m²';
  document.getElementById('bmr-value').textContent = Math.round(bmr) + ' kcal';
  document.getElementById('spec-diff-value').textContent = specDiff.toFixed(1);
}

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('current-time').textContent = `${h}:${m}:${s}`;
}

// ===== UPTIME =====
const startTime = Date.now();
function updateUptime() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  if (min > 0) {
    document.getElementById('uptime').textContent = `${min}m${sec}s`;
  } else {
    document.getElementById('uptime').textContent = `${sec}s`;
  }
}

// ===== PARTICLE BACKGROUND =====
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.size = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '0, 240, 255' : '176, 38, 255';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
      // glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha * 0.15})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();
}

// ===== TYPING EFFECT FOR NOTICE =====
function initTypingEffect() {
  const el = document.querySelector('.typing-effect');
  if (!el) return;
  const text = el.textContent;
  el.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, 60 + Math.random() * 40);
    }
  }
  setTimeout(type, 800);
}

// ===== CARD ENTRANCE ANIMATION =====
function initEntranceAnimations() {
  const groups = document.querySelectorAll('.data-group, .stats-row, .spec-section, .notice-section, .discord-section');
  groups.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(15px)';
    el.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(0)';
    }, 300 + i * 100);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateProfileData();
  updateClock();
  initParticles();
  initTypingEffect();
  initEntranceAnimations();

  setInterval(updateClock, 1000);
  setInterval(updateUptime, 1000);
  // Refresh age every minute (in case day changes)
  setInterval(updateProfileData, 60000);
});
