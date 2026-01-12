document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica da Grid de Jogos (Home) ---
    const gamesGrid = document.getElementById('gamesGrid');

    if (gamesGrid) {
        // Lista com 9 jogos para preencher a grade 3x3
        const games = [
            { title: "A Flor da Meia-Noite", color: "green" },
            { title: "Veredas de Espinho", color: "purple" },
            { title: "Sombra do Agreste", color: "green" },
            { title: "Terra Rachada", color: "green" },
            { title: "Lâmina do Sol", color: "purple" },
            { title: "Raízes de Pedra", color: "green" },
            { title: "Neon Caatinga", color: "green" },
            { title: "A Última Gota", color: "purple" },
            { title: "Asa Branca: A Jornada", color: "green" }
        ];

        games.forEach((game) => {
            const card = document.createElement('div');
            card.classList.add('game-card');
            
            if (game.color === 'purple') {
                card.classList.add('card-purple');
            } else {
                card.classList.add('card-green');
            }

            // Usando uma imagem online do jogo Celeste.
            card.style.backgroundImage = "url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Celeste_box_art_full.png/640px-Celeste_box_art_full.png')";

            const title = document.createElement('h3');
            title.classList.add('game-title');
            title.innerText = game.title;

            card.appendChild(title);
            gamesGrid.appendChild(card);
        });
    }

    // --- Lógica do Formulário (Página Cadastro) ---
    const formCadastro = document.getElementById('personalInfoForm');
    const btnLimpar = document.getElementById('btnLimpar');

    if (formCadastro) {
        // Botão Limpar
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                const confirmClear = confirm("Deseja realmente limpar todos os campos?");
                if (confirmClear) {
                    formCadastro.reset();
                    const addressForm = document.getElementById('addressForm');
                    if(addressForm) addressForm.reset();
                }
            });
        }

        // Evento de Envio
        formCadastro.addEventListener('submit', (event) => {
            event.preventDefault(); 
            
            const nomeInput = document.getElementById('nome');
            const nome = nomeInput ? nomeInput.value : 'Visitante';
            
            alert(`Obrigado, ${nome}! Seu cadastro foi simulado com sucesso.`);
            
            formCadastro.reset();
            const addressForm = document.getElementById('addressForm');
            if(addressForm) addressForm.reset();
        });
    }
});