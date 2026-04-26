// Verifica se o clique esta dentro do raio permitido para um erro.
function isHit(mouseX, mouseY, error) {
  return Math.hypot(mouseX - error.x, mouseY - error.y) <= error.r;
}

// Formata o tempo no mesmo padrao exibido ao jogador na interface.
function formatTime(timeLeft) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");
  return minutes + ":" + seconds;
}

// A partida termina apenas quando todos os erros foram encontrados.
function isGameFinished(found, totalErrors) {
  return found === totalErrors;
}

// Mantem a regra de pontuacao isolada para facilitar testes e manutencao.
function calculateStars(found, totalErrors, timeLeft) {
  if (found === totalErrors && timeLeft >= 20) {
    return 5;
  }

  if (found === totalErrors) {
    return 4;
  }

  return found;
}

// Separa o calculo da barra para reaproveitamento e testes unitarios.
function getProgressBarWidth(timeLeft, totalTime) {
  // Evita divisao por zero e resultados invalidos na interface.
  if (totalTime <= 0) {
    return 0;
  }

  return (timeLeft / totalTime) * 100;
}

module.exports = {
  isHit,
  formatTime,
  isGameFinished,
  calculateStars,
  getProgressBarWidth
};
