/* Fundacja Szansa AI — wspólna logika stron (nav, animacje GSAP, tło Three.js,
   moduł wpłat, formularze). Ładowany na każdej podstronie po GSAP/ScrollTrigger/Three.js. */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Nawigacja, moduł wpłat i formularze MUSZĄ działać nawet jeśli CDN z GSAP/Three.js
  // akurat nie odpowie (słaby internet, zablokowany CDN u odbiorcy) — dlatego są
  // odpalane niezależnie od reszty, a animacje mają osobny, izolowany fallback.
  initNav();
  initYear();
  initDonationWidget();

  if (typeof gsap === "undefined") {
    console.warn("GSAP nie załadował się z CDN — strona działa, ale bez animacji.");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  initHeroAnimations();
  initRevealCards();
  initParallaxTiles();
  initHorizontalScroll();
  initCounters();
  initHeroTilt();
  initThreeBackground();
});

/* ---------- nawigacja mobilna ---------- */
function initNav() {
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");
  if (!menuBtn || !navLinks) return;
  menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => navLinks.classList.remove("open"))
  );
}

function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- animacje wejścia (hero) — tylko gdy sekcja istnieje ---------- */
function initHeroAnimations() {
  if (document.querySelector(".hero-copy")) {
    gsap.from(".hero-copy > *", { y: 36, opacity: 0, duration: 1.1, stagger: 0.12, ease: "power3.out" });
  }
  if (document.querySelector(".floating-card")) {
    gsap.from(".floating-card", {
      scale: 0.72, opacity: 0, rotate: 18, duration: 1.2, stagger: 0.13,
      ease: "elastic.out(1,0.6)", delay: 0.3,
    });
  }
}

/* ---------- scroll reveal dla kart ---------- */
function initRevealCards() {
  gsap.utils.toArray(".reveal-card").forEach((card) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: "top 82%" },
      y: 70, opacity: 0, duration: 0.9, ease: "power3.out",
    });
  });
}

function initParallaxTiles() {
  gsap.utils.toArray(".parallax-tile").forEach((tile, index) => {
    gsap.to(tile, {
      y: index % 2 === 0 ? -34 : 34,
      scrollTrigger: { trigger: tile, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

/* ---------- poziomy scroll (sekcja programów/pakietów) ---------- */
function initHorizontalScroll() {
  const hTrack = document.getElementById("hTrack");
  if (!hTrack || window.innerWidth <= 760) return;
  gsap.to(hTrack, {
    x: () => -(hTrack.scrollWidth - window.innerWidth + 80),
    ease: "none",
    scrollTrigger: {
      trigger: ".horizontal-section",
      start: "top top",
      end: () => "+=" + (hTrack.scrollWidth - window.innerWidth + 500),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
}

/* ---------- liczniki ---------- */
function initCounters() {
  gsap.utils.toArray(".counter").forEach((counter) => {
    const target = +counter.dataset.target;
    gsap.fromTo(
      counter,
      { innerText: 0 },
      {
        innerText: target,
        duration: 1.7,
        ease: "power2.out",
        snap: { innerText: 1 },
        scrollTrigger: { trigger: counter, start: "top 85%", once: true },
        onUpdate() {
          const val = Math.floor(counter.innerText);
          counter.innerText = target >= 1000 ? val.toLocaleString("pl-PL") + "+" : val;
        },
      }
    );
  });
}

/* ---------- przechył 3D kart w hero (tylko strona główna) ---------- */
function initHeroTilt() {
  const stage = document.getElementById("heroStage");
  if (!stage) return;
  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(".hero-stage", { rotateY: x * 6, rotateX: -y * 6, duration: 0.6, ease: "power2.out" });
  });
  stage.addEventListener("mouseleave", () => {
    gsap.to(".hero-stage", { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power2.out" });
  });
}

/* ---------- moduł wpłat (strona wsparcie.html) ---------- */
const DONATION_IMPACT = [
  [500, "500 zł = pół dnia szkoleniowego w jednej szkole"],
  [200, "200 zł = udział całej klasy w module o bezpieczeństwie AI"],
  [100, "100 zł = godzina szkolenia dla klasy z małej miejscowości"],
  [50, "50 zł = materiały edukacyjne dla całej klasy"],
  [30, "30 zł = wydrukowany „Bezpieczny AI-Guide” dla jednej rodziny"],
];

/* Payment Links operatora (PayU) — uzupełnić po aktywacji konta merchant.
   Do tego czasu przycisk pokazuje dane do przelewu tradycyjnego. */
const PAYMENT_CONFIG = {
  oneTimeUrl: null,
  monthlyUrl: null,
  bankAccount: { name: 'Fundacja "Szansa AI"', iban: "PL48 1020 1909 0000 3702 0328 7976", title: "Darowizna na cele statutowe" },
};

function initDonationWidget() {
  const widget = document.querySelector("[data-donation-widget]");
  if (!widget) return;

  const amountBtns = widget.querySelectorAll(".amount[data-amount]");
  const customInput = widget.querySelector("#custom-amount");
  const freqBtns = widget.querySelectorAll(".freq-toggle button");
  const impactLine = widget.querySelector(".impact-line");
  const donateBtn = widget.querySelector("#donate-btn");
  if (!donateBtn) return;

  let amount = 100;
  let frequency = "once";

  function render() {
    amountBtns.forEach((b) =>
      b.classList.toggle("active", Number(b.dataset.amount) === amount && !customInput.value)
    );
    const match = DONATION_IMPACT.find(([threshold]) => amount >= threshold);
    impactLine.textContent = match ? match[1] : "Każda złotówka wspiera edukację AI dzieci z małych miejscowości.";
    donateBtn.querySelector("span").textContent =
      frequency === "monthly" ? `Wspieraj kwotą ${amount} zł miesięcznie` : `Przekaż ${amount} zł`;
  }

  amountBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      amount = Number(btn.dataset.amount);
      customInput.value = "";
      render();
    })
  );
  customInput.addEventListener("input", () => {
    const v = Number(customInput.value);
    if (v > 0) amount = v;
    render();
  });
  freqBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      frequency = btn.dataset.freq;
      freqBtns.forEach((b) => b.classList.toggle("active", b === btn));
      render();
    })
  );

  donateBtn.addEventListener("click", () => {
    const url = frequency === "monthly" ? PAYMENT_CONFIG.monthlyUrl : PAYMENT_CONFIG.oneTimeUrl;
    if (url) {
      window.location.href = url;
      return;
    }
    const { name, iban, title } = PAYMENT_CONFIG.bankAccount;
    alert(
      "Moduł płatności online (PayU) zostanie aktywowany po dokończeniu integracji.\n\n" +
        `Do tego czasu prosimy o przelew tradycyjny:\n${name}\n${iban}\nTytuł: ${title} — ${amount} zł` +
        (frequency === "monthly" ? " (zlecenie stałe)" : "")
    );
  });

  render();
}

/* ---------- demo formularzy (do czasu podpięcia backendu / umów powierzenia) ---------- */
window.szansaFormDemo = function (event) {
  event.preventDefault();
  alert("Dziękujemy! To formularz demonstracyjny — zostanie podłączony do maila lub backendu przed publikacją strony.");
  return false;
};

/* ---------- tło: sieć cząstek Three.js ---------- */
function initThreeBackground() {
  const canvas = document.getElementById("webgl");
  if (!canvas || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 42;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const particlesCount = 1400;
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
  }
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.075, color: 0xf0c14b, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  const ringGeometry = new THREE.TorusGeometry(16, 0.018, 16, 160);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xf5c971, transparent: true, opacity: 0.18 });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = 1.15;
  ring.rotation.y = 0.35;
  scene.add(ring);

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.0009;
    particles.rotation.x += 0.0003;
    ring.rotation.z += 0.002;
    camera.position.x += (mouseX * 1.6 - camera.position.x) * 0.025;
    camera.position.y += (-mouseY * 1.2 - camera.position.y) * 0.025;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    ScrollTrigger.refresh();
  });
}
