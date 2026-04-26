const SECS = 60;
const HIT = 42;

// Fonte unica das diferencas do jogo.
// x e y indicam o centro do erro na imagem original; r define o raio clicavel.
const points = [
  { x: 261, y: 132, r: 58 },
  { x: 632, y: 134, r: 50 },
  { x: 644, y: 430, r: 52 },
  { x: 202, y: 897, r: 52 },
  { x: 600, y: 1059, r: 50 }
];

const img1 = new Image();
const img2 = new Image();

// Estado compartilhado da rodada atual.
// Manter esse bloco centralizado facilita entender o ciclo do jogo.
let loaded = 0;
let scale = 1;
let found = 0;
let timeLeft = SECS;
let timer = null;
let playing = false;
let errors = [];

img1.src = '/img/Anime_Girl_1.jpg';
img2.src = '/img/Anime_Girl_2.jpg';
img1.onload = img2.onload = () => loaded++;

// Troca de tela em um unico ponto para evitar regras de exibicao duplicadas.
function go(id) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('on'));
  document.getElementById(id).classList.add('on');
}

// Prepara uma nova partida limpando estado visual e logico.
function startGame() {
  // So calcula escala depois que as imagens tiverem dimensoes reais.
  if (loaded < 2) {
    setTimeout(startGame, 100);
    return;
  }

  found = 0;
  timeLeft = SECS;
  playing = true;
  go('s2');

  // Recria os indicadores a cada partida para evitar estado residual.
  document.getElementById('dots').innerHTML = points
    .map((_, index) => `<div class="dot" id="d${index}"></div>`)
    .join('');

  drawImages();

  // Ajusta os pontos originais para o tamanho atual do canvas.
  // O raio minimo melhora a jogabilidade em telas pequenas.
  errors = points.map((point) => ({
    x: point.x * scale,
    y: point.y * scale,
    r: Math.max(HIT, point.r * scale),
    found: false
  }));

  document.getElementById('c1').onclick = checkClick;
  document.getElementById('c2').onclick = checkClick;
  startTimer();
}

// Mantem os canvases responsivos sem distorcer a proporcao das imagens.
function drawImages() {
  const sideBySide = window.innerWidth >= 760;
  const maxW = sideBySide
    ? Math.min(Math.floor((window.innerWidth - 56) / 2), 440)
    : Math.min(window.innerWidth - 40, 360);
  const maxH = sideBySide
    ? window.innerHeight - 220
    : Math.floor((window.innerHeight - 240) / 2);
  const w = img1.naturalWidth;
  const h = img1.naturalHeight;

  // Nunca amplia a imagem acima do tamanho natural para preservar nitidez.
  scale = Math.min(maxW / w, Math.max(maxH, 180) / h, 1);

  [
    ['c1', img1],
    ['c2', img2]
  ].forEach(([id, image]) => {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');

    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  });
}

// Converte o clique da tela para coordenadas reais do canvas antes da comparacao.
function checkClick(event) {
  if (!playing) return;

  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

  // Ignora erros ja encontrados para impedir contagem duplicada.
  const error = errors.find((item) => {
    return !item.found && Math.hypot(mouseX - item.x, mouseY - item.y) <= item.r;
  });

  if (!error) return;

  error.found = true;
  found++;
  document.getElementById('d' + (found - 1)).classList.add('on');
  drawMarks();

  if (found === points.length) finishGame();
}


function drawMarks() {
  drawImages();

  errors.forEach((error, index) => {
    if (!error.found) return;

    ['c1', 'c2'].forEach((id) => {
      const ctx = document.getElementById(id).getContext('2d');
      const labelY = Math.max(14, error.y - error.r - 10);

      // save/restore evita que estilos vazem para os proximos desenhos.
      ctx.save();
      ctx.strokeStyle = '#ff37b2';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff8ed0';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(error.x, error.y, error.r, 0, Math.PI * 2);
      ctx.stroke();

      // O marcador numerado reforca o feedback visual do acerto.
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#bf2a68';
      ctx.beginPath();
      ctx.arc(error.x, labelY, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Nunito';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(index + 1, error.x, labelY);
      ctx.restore();
    });
  });
}

// Sempre limpa o intervalo anterior antes de iniciar outro timer.
function startTimer() {
  clearInterval(timer);
  document.getElementById('bar').style.width = '100%';
  document.getElementById('bar').classList.remove('red');
  updateTimer();

  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    document.getElementById('bar').style.width = (timeLeft / SECS * 100) + '%';

    // Feedback visual de urgencia nos segundos finais.
    document.getElementById('bar').classList.toggle('red', timeLeft <= 15);

    if (timeLeft <= 0) finishGame();
  }, 1000);
}

// Mantem a regra de formatacao do tempo em um unico lugar.
function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, '0');
  document.getElementById('tNum').textContent = minutes + ':' + seconds;
}

// Encerra a interacao e agenda a tela final com um pequeno atraso visual.
function finishGame() {
  playing = false;
  clearInterval(timer);
  setTimeout(showResult, 500);
}

// Deriva a pontuacao final a partir do estado atual da rodada.
function showResult() {
  const stars = found === points.length && timeLeft >= 20 ? 5 : found === points.length ? 4 : found;
  const titles = ['N\u00e3o foi dessa vez...', 'Continue tentando!', 'Bom esfor\u00e7o!', 'Muito bem!', '\u00d3timo!', 'Parabéns!'];

  document.getElementById('rTitle').textContent = titles[stars];
  document.getElementById('rStars').textContent = '\u2b50'.repeat(stars) + '\u2606'.repeat(5 - stars);
  document.getElementById('rFound').textContent = found + '/5';
  document.getElementById('rTime').textContent = document.getElementById('tNum').textContent;
  go('s3');
}

// Garante limpeza minima antes de voltar para a tela inicial.
function goStart() {
  playing = false;
  clearInterval(timer);
  go('s1');
}
