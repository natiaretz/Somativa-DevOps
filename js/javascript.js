const SECS = 60;
const HIT = 42;

// Coordenadas das 5 diferencas na imagem original.
// x e y indicam o centro da diferenca, r indica o tamanho da area clicavel.
const points = [
  { x: 261, y: 132, r: 58 },
  { x: 632, y: 134, r: 50 },
  { x: 644, y: 430, r: 52 },
  { x: 202, y: 897, r: 52 },
  { x: 600, y: 1059, r: 50 }
];

const img1 = new Image();
const img2 = new Image();

// Variaveis que guardam o estado atual do jogo.
let loaded = 0;
let scale = 1;
let found = 0;
let timeLeft = SECS;
let timer = null;
let playing = false;
let errors = [];

img1.src = 'img/Anime_Girl_1.jpg';
img2.src = 'img/Anime_Girl_2.jpg';
img1.onload = img2.onload = () => loaded++;

// Mostra apenas a tela escolhida e esconde as outras.
function go(id) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('on'));
  document.getElementById(id).classList.add('on');
}

// Reinicia os dados do jogo, desenha as imagens e liga o timer.
function startGame() {
  // Espera as imagens carregarem antes de usar largura e altura delas.
  if (loaded < 2) {
    setTimeout(startGame, 100);
    return;
  }

  found = 0;
  timeLeft = SECS;
  playing = true;
  go('s2');

  // Cria as bolinhas que mostram quantas diferencas ja foram encontradas.
  document.getElementById('dots').innerHTML = points
    .map((_, index) => `<div class="dot" id="d${index}"></div>`)
    .join('');

  drawImages();

  // Converte as coordenadas originais para o tamanho em que a imagem aparece.
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

// Ajusta o tamanho dos canvases e desenha as duas imagens.
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

// Verifica se o clique do jogador acertou alguma diferenca.
function checkClick(event) {
  if (!playing) return;

  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

  // Math.hypot calcula a distancia entre o clique e o centro de cada erro.
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

// Redesenha as imagens e coloca circulos nos erros encontrados.
function drawMarks() {
  drawImages();

  errors.forEach((error, index) => {
    if (!error.found) return;

    ['c1', 'c2'].forEach((id) => {
      const ctx = document.getElementById(id).getContext('2d');
      const labelY = Math.max(14, error.y - error.r - 10);

      // Circulo rosa ao redor da diferenca.
      ctx.save();
      ctx.strokeStyle = '#ff37b2';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff8ed0';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(error.x, error.y, error.r, 0, Math.PI * 2);
      ctx.stroke();

      // Bolinha rosa com o numero do acerto.
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

// Inicia a contagem regressiva de 60 segundos.
function startTimer() {
  clearInterval(timer);
  document.getElementById('bar').style.width = '100%';
  document.getElementById('bar').classList.remove('red');
  updateTimer();

  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    document.getElementById('bar').style.width = (timeLeft / SECS * 100) + '%';

    // Nos ultimos 15 segundos, a barra fica vermelha.
    document.getElementById('bar').classList.toggle('red', timeLeft <= 15);

    if (timeLeft <= 0) finishGame();
  }, 1000);
}

// Atualiza o texto do timer no formato minuto:segundo.
function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, '0');
  document.getElementById('tNum').textContent = minutes + ':' + seconds;
}

// Para o jogo e chama a tela de resultado.
function finishGame() {
  playing = false;
  clearInterval(timer);
  setTimeout(showResult, 500);
}

// Preenche a tela final com estrelas, mensagem, acertos e tempo restante.
function showResult() {
  const stars = found === points.length && timeLeft >= 20 ? 5 : found === points.length ? 4 : found;
  const titles = ['N\u00e3o foi dessa vez...', 'Continue tentando!', 'Bom esfor\u00e7o!', 'Muito bem!', '\u00d3timo!', 'Parabéns!'];

  document.getElementById('rTitle').textContent = titles[stars];
  document.getElementById('rStars').textContent = '\u2b50'.repeat(stars) + '\u2606'.repeat(5 - stars);
  document.getElementById('rFound').textContent = found + '/5';
  document.getElementById('rTime').textContent = document.getElementById('tNum').textContent;
  go('s3');
}

// Volta para a tela inicial.
function goStart() {
  playing = false;
  clearInterval(timer);
  go('s1');
}
