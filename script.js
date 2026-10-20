(() => {
  const track = document.querySelector('.scroll-track');
  const scene = document.querySelector('.scene');
  const opening = document.querySelector('.opening');
  const envelope = document.querySelector('.envelope');
  const letter = document.querySelector('.letter');
  const ending = document.querySelector('.ending');
  const hint = document.querySelector('.scroll-hint');
  const lines = [...document.querySelectorAll('.letter-lines p')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
  const map = (p, a, b) => ease((p - a) / (b - a));

  // Petals are created once and only their compositor-friendly transforms change.
  const petalField = document.querySelector('.petals');
  if (!reduceMotion) {
    for (let i = 0; i < 17; i++) {
      const petal = document.createElement('i');
      petal.className = 'petal';
      petal.style.setProperty('--x', `${(i * 61 + 13) % 100}%`);
      petal.style.setProperty('--phase', `${(i * .173) % 1}`);
      petal.style.setProperty('--size', `${7 + (i * 7) % 9}px`);
      petalField.appendChild(petal);
    }
  }

  let last = -1, raf = 0;
  function render() {
    raf = 0;
    const rect = track.getBoundingClientRect();
    const span = Math.max(1, track.offsetHeight - innerHeight);
    const p = clamp(-rect.top / span);
    if (Math.abs(p - last) < .00015) return;
    last = p;

    const openOut = map(p, .025, .12);
    opening.style.opacity = `${1 - openOut}`;
    opening.style.transform = `translate3d(-50%, calc(-50% - ${openOut * 42}px), 0) scale(${1 - openOut * .06})`;
    hint.style.opacity = `${1 - map(p, .02, .09)}`;

    const arrival = map(p, .095, .25);
    const flap = map(p, .255, .36);
    const letterRise = map(p, .32, .46);
    const envelopeOpacity = 1 - map(p, .39, .48);
    envelope.style.opacity = `${envelopeOpacity}`;
    envelope.style.transform = `translate3d(-50%, calc(-50% + ${(1 - arrival) * 130}px), 0) rotate(${(1-arrival)*-12 + arrival*2}deg) scale(${.62 + arrival*.38})`;
    envelope.style.setProperty('--flap-open', `${flap * 180}deg`);
    envelope.style.setProperty('--letter-rise', `${letterRise * 125}%`);

    const letterIn = map(p, .405, .49);
    const letterOut = map(p, .79, .88);
    const shiftAway = map(p, .75, .88);
    letter.style.opacity = `${letterIn * (1-letterOut)}`;
    letter.style.transform = `translate3d(-50%, calc(-50% + ${(1-letterIn)*58 - shiftAway*100}px), 0) rotate(${(1-letterIn)*4 - shiftAway*5}deg) scale(${.88 + letterIn*.12 - shiftAway*.18})`;

    lines.forEach((line, i) => {
      const start = .475 + i * .036;
      const reveal = map(p, start, start + .038);
      const fade = 1 - map(p, .80 + i * .006, .86 + i * .006);
      line.style.opacity = `${reveal * fade}`;
      line.style.transform = `translate3d(0, ${(1-reveal)*11}px, 0)`;
    });
    const final = map(p, .81, .9);
    ending.style.opacity = `${final}`;
    ending.style.transform = `translate3d(-50%, calc(-50% + ${(1-final)*25}px), 0) scale(${.97 + final*.03})`;
    const endingStarts = [.82, .838, .856, .874, .892, .92, .946, .965, .978];
    [...ending.children].forEach((node, i) => {
      const reveal = map(p, endingStarts[i], endingStarts[i] + .02);
      node.style.opacity = `${reveal}`;
      const scale = node.matches('h2') ? .96 + reveal * .04 : 1;
      node.style.transform = `translate3d(0, ${(1-reveal)*9}px, 0) scale(${scale})`;
      if (node.classList.contains('ending-sign')) node.style.clipPath = `inset(0 ${((1-reveal)*100).toFixed(1)}% 0 0)`;
    });
    scene.classList.toggle('calm', p > .88);
    scene.style.setProperty('--progress', p);
    petalField.style.opacity = `${p > .88 ? .42 : .82}`;
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(render); }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule, { once: true });
  render();
})();
