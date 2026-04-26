const {
  isHit,
  formatTime,
  isGameFinished,
  calculateStars
} = require("../src/gamerules");

// Os testes abaixo checam o funcionamento principal do jogo.
test("deve reconhecer quando o clique acerta uma diferenca", () => {
  const error = { x: 100, y: 100, r: 50 };

  expect(isHit(120, 120, error)).toBe(true);
});

test("deve reconhecer quando o clique fica fora da diferenca", () => {
  const error = { x: 100, y: 100, r: 50 };

  expect(isHit(200, 200, error)).toBe(false);
});

test("deve formatar o tempo no padrao exibido pelo jogo", () => {
  expect(formatTime(60)).toBe("1:00");
  expect(formatTime(9)).toBe("0:09");
});

// Esse teste protege a regra de fim de jogo caso a contagem mude no futuro.
test("deve indicar quando o jogador encontrou todos os erros", () => {
  expect(isGameFinished(5, 5)).toBe(true);
  expect(isGameFinished(3, 5)).toBe(false);
});

// Valida os principais cenarios de pontuacao final sem acoplar os testes a UI.
test("deve calcular as estrelas conforme desempenho e tempo restante", () => {
  expect(calculateStars(5, 5, 25)).toBe(5);
  expect(calculateStars(5, 5, 10)).toBe(4);
  expect(calculateStars(3, 5, 20)).toBe(3);
});
