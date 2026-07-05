(function () {
  const body = document.body;
  const meterFill = document.getElementById('meterFill');
  const thresholdMark = document.getElementById('thresholdMark');
  const sens = document.getElementById('sens');
  const tabBtn = document.getElementById('tabBtn');
  const micBtn = document.getElementById('micBtn');
  const testBtn = document.getElementById('testBtn');
  const soundToggle = document.getElementById('soundToggle');
  const countEl = document.getElementById('count');
  const errMsg = document.getElementById('errMsg');

  let audioCtx = null, analyser = null, stream = null, running = false;
  let sourceMode = null; // 'tab' | 'mic'
  let hissCount = 0, hissLock = false, hissTimer = null;
  let smooth = 0;

  // 威嚇回数を日付ごとに保存
  const todayKey = 'hiss-' + new Date().toISOString().slice(0, 10);
  chrome.storage?.local.get(todayKey).then((r) => {
    hissCount = r[todayKey] || 0;
    countEl.textContent = hissCount;
  }).catch(() => {});

  function threshold() { return 65 - parseInt(sens.value, 10); }
  function updateThresholdMark() { thresholdMark.style.left = threshold() + '%'; }
  sens.addEventListener('input', updateThresholdMark);
  updateThresholdMark();

  function setState(s) {
    body.classList.remove('calm', 'alert', 'hissing');
    body.classList.add(s);
  }

  function ensureCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playHissSound() {
    if (!soundToggle.checked) return;
    try {
      const ctx = ensureCtx();
      const dur = 0.7;
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5);
      }
      const src = ctx.createBufferSource(); src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 4200; bp.Q.value = 0.7;
      const g = ctx.createGain(); g.gain.value = 0.5;
      src.connect(bp).connect(g).connect(ctx.destination);
      src.start();
    } catch (e) {}
  }

  function triggerHiss() {
    setState('hissing');
    if (!hissLock) {
      hissLock = true;
      hissCount++; countEl.textContent = hissCount;
      chrome.storage?.local.set({ [todayKey]: hissCount }).catch(() => {});
      playHissSound();
      setTimeout(() => { hissLock = false; }, 900);
    }
    clearTimeout(hissTimer);
    hissTimer = setTimeout(() => {
      setState(running ? 'alert' : 'calm');
      if (!running) setTimeout(() => setState('calm'), 400);
    }, 800);
  }

  testBtn.addEventListener('click', triggerHiss);

  function loop() {
    if (!running) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128; sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    const level = Math.min(100, rms * 400);
    smooth = smooth * 0.7 + level * 0.3;
    meterFill.style.width = smooth + '%';

    const t = threshold();
    if (smooth >= t) {
      triggerHiss();
    } else if (smooth >= t * 0.55) {
      if (!body.classList.contains('hissing')) setState('alert');
    } else {
      if (!body.classList.contains('hissing')) setState('calm');
    }
    requestAnimationFrame(loop);
  }

  function attachStream(s, mode, passthrough) {
    const ctx = ensureCtx();
    const src = ctx.createMediaStreamSource(s);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    src.connect(analyser);
    // タブキャプチャ中は音がミュートされるため、スピーカー/ヘッドホンへ流し直す
    if (passthrough) src.connect(ctx.destination);
    stream = s;
    sourceMode = mode;
    running = true;
    errMsg.style.display = 'none';
    updateButtons();
    loop();
    s.getTracks().forEach((t) => (t.onended = stopAll));
  }

  function updateButtons() {
    tabBtn.textContent = (running && sourceMode === 'tab') ? '⏹ タブ音声の取得を停止' : '🎧 このタブの音声をひろう';
    tabBtn.classList.toggle('on', running && sourceMode === 'tab');
    micBtn.textContent = (running && sourceMode === 'mic') ? '⏹ マイクをオフにする' : '🎙 マイクでひろう（スピーカー通話）';
    micBtn.classList.toggle('on', running && sourceMode === 'mic');
  }

  function stopAll() {
    running = false;
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    sourceMode = null;
    updateButtons();
    meterFill.style.width = '0%';
    setState('calm');
  }

  function showErr(msg) {
    errMsg.style.display = 'block';
    errMsg.textContent = msg;
  }

  async function startTab() {
    stopAll();
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) { showErr('アクティブなタブが見つかりません。通話ソフトのタブを開いてから押してください。'); return; }
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
        showErr('このページの音声は取得できません。通話ソフトなど、通常のWebページのタブで試してください。');
        return;
      }
      const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
      const s = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'tab',
            chromeMediaSourceId: streamId
          }
        },
        video: false
      });
      attachStream(s, 'tab', true); // passthrough=trueで通話音声はそのまま聞こえる
    } catch (e) {
      showErr('タブ音声を取得できませんでした。通話ソフトのタブをアクティブにした状態で、もう一度ボタンを押してください。（エラー: ' + (e.message || e) + '）');
    }
  }

  async function startMic() {
    stopAll();
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      attachStream(s, 'mic', false);
    } catch (e) {
      showErr('マイクを使えませんでした。拡張機能のマイク許可を確認してください。');
    }
  }

  tabBtn.addEventListener('click', () => (running && sourceMode === 'tab') ? stopAll() : startTab());
  micBtn.addEventListener('click', () => (running && sourceMode === 'mic') ? stopAll() : startMic());
})();
