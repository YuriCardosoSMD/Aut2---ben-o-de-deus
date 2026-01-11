document.addEventListener('DOMContentLoaded', () => {
    const gamesGrid = document.getElementById('gamesGrid');
    
    // Configuração dos jogos (9 cards como na imagem)
    // O padrão da imagem parece ser: Verde, Roxo, Verde, Verde, Roxo, Verde...
    // Mas para ficar harmônico, vou fazer alternado ou seguir a lógica da imagem.
    
    const totalGames = 9;
    
    for (let i = 0; i < totalGames; i++) {
        const card = document.createElement('div');
        card.classList.add('game-card');
        
        // Lógica de cores baseada na imagem:
        // Coluna do meio (índices 1, 4, 7 se for base 0 e grid de 3 colunas) é roxa?
        // Na imagem: Linha 1 (Verde, Roxo, Verde), Linha 2 (Verde, Roxo, Verde)...
        // Então vamos definir: O segundo item de cada linha de 3 é roxo.
        
        // Simulação simples: se o resto da divisão por 3 for 1, é o meio (roxo).
        if (i % 3 === 1) {
            card.classList.add('card-purple');
        } else {
            card.classList.add('card-green');
        }

        // Adiciona uma imagem de fundo genérica (Celeste)
        // Aqui você colocaria a URL real da imagem do jogo
        card.style.backgroundImage = "url('https://placehold.co/300x400/333/333')"; 

        // Título do jogo
        const title = document.createElement('h3');
        title.classList.add('game-title');
        title.innerText = 'Celeste';

        card.appendChild(title);
        gamesGrid.appendChild(card);
    }

    // Interatividade básica dos botões (opcional)
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log(`Botão clicado: ${btn.innerText}`);
        });
    });
});