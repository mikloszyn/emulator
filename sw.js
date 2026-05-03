// 1. Zegar systemowy
function startClock() {
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    
    const update = () => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        dateEl.textContent = now.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    
    setInterval(update, 1000);
    update();
}

// 2. Obsługa ładowania gry
const romInput = document.getElementById('rom-input');
const emuWrapper = document.getElementById('emulator-wrapper');
const topScreen = document.getElementById('top-screen');

function openFileSelector() {
    romInput.click();
}

romInput.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Zmiana interfejsu na tryb gry
    emuWrapper.style.display = 'block';
    topScreen.innerHTML = '<div style="margin-top:120px">URUCHAMIANIE...</div>';

    // Konfiguracja EmulatorJS
    // UWAGA: Musisz posiadać folder /data/ z loader.js, nds.js i nds.wasm
    window.EJS_player = '#emulator-target'; // Tu musi być ID diva wewnątrz wrapper
    window.EJS_core = 'nds';
    window.EJS_gameUrl = URL.createObjectURL(file);
    window.EJS_pathtodata = 'data/'; 
    window.EJS_startOnLoaded = true;

    // Ładowanie głównego loadera
    const loaderScript = document.createElement('script');
    loaderScript.src = 'data/loader.js';
    document.head.appendChild(loaderScript);
};

// 3. Rejestracja Service Workera (Kluczowe dla Firefox)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            console.log('DS System: Zabezpieczenia aktywne');
        }).catch(err => {
            console.error('DS System: Błąd krytyczny SW', err);
        });
    });
}

// Inicjalizacja zegara przy starcie
document.addEventListener('DOMContentLoaded', startClock);    alert("Błąd pobierania core");
    throw new Error("fetch error");
  }

  const bytes = await res.arrayBuffer();

  const wasm = await WebAssembly.instantiate(bytes, {
    env: {
      memory: new WebAssembly.Memory({ initial: 256 })
    }
  });

  console.log("Core OK");
  return wasm.instance;
}

// 🚀 Start emulatora
function startEmu() {
  running = true;

  if (instance.exports.loadROM) {
    const ptr = instance.exports.alloc(rom.length);
    const mem = new Uint8Array(instance.exports.memory.buffer);

    mem.set(rom, ptr);
    instance.exports.loadROM(ptr, rom.length);
  }

  loop();
}

// 🎥 Pętla
function loop() {
  if (!running) return;

  if (instance.exports.frame) {
    instance.exports.frame();
  } else {
    fakeScreen();
  }

  requestAnimationFrame(loop);
}

// 🧪 Fallback (gdy brak core)
function fakeScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  ctx.fillText("Brak core emulatora", 40, 100);
}

// 📸 Screenshot
document.getElementById("shotBtn").onclick = () => {
  const a = document.createElement("a");
  a.download = "screen.png";
  a.href = canvas.toDataURL();
  a.click();
};

// 🔄 Tryb ekranu
document.getElementById("mode").onchange = e => {
  if (e.target.value === "horizontal") {
    canvas.width = 512;
    canvas.height = 192;
  } else {
    canvas.width = 256;
    canvas.height = 384;
  }
};

// 🎮 Sterowanie
document.querySelectorAll("#controls button").forEach(btn => {
  const key = btn.dataset.k;

  btn.addEventListener("mousedown", () => send(key));
  btn.addEventListener("touchstart", () => send(key));
});

function send(key) {
  console.log("KEY:", key);

  if (instance && instance.exports.input) {
    instance.exports.input(key);
  }
}
