// 🔗 TU WKLEJ URL DO CORE (.wasm)
const CORE_URL = "ds.44670.org";

let rom = null;
let instance = null;
let running = false;

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

// 📂 Wczytanie ROM
document.getElementById("romInput").addEventListener("change", e => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    rom = new Uint8Array(reader.result);
    alert("ROM załadowany");
  };

  reader.readAsArrayBuffer(file);
});

// ▶️ START
document.getElementById("startBtn").onclick = async () => {
  if (!rom) return alert("Najpierw wybierz ROM");

  instance = await loadCore();
  startEmu();
};

// 📥 Pobieranie core
async function loadCore() {
  const res = await fetch(CORE_URL);

  if (!res.ok) {
    alert("Błąd pobierania core");
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
