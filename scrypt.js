document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica da Grid de Jogos (Home) ---
    const gamesGrid = document.getElementById('gamesGrid');

    if (gamesGrid) {
        // Lista com 9 jogos para preencher a grade 3x3
        // Padrão intercalado de cores: Verde e Roxo
        const games = [
            { title: "Celeste", color: "green" },
            { title: "Celeste", color: "purple" },
            { title: "Celeste", color: "green" },
            { title: "Celeste", color: "green" },
            { title: "Celeste", color: "purple" },
            { title: "Celeste", color: "green" },
            { title: "Celeste", color: "green" },
            { title: "Celeste", color: "purple" },
            { title: "Celeste", color: "green" }
        ];

        games.forEach((game) => {
            const card = document.createElement('div');
            card.classList.add('game-card');
            
            // Adiciona a classe de cor correspondente
            if (game.color === 'purple') {
                card.classList.add('card-purple');
            } else {
                card.classList.add('card-green');
            }

            // Define a imagem de fundo. 
            // Usando uma imagem online do jogo Celeste.
            card.style.backgroundImage = "url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Celeste_box_art_full.png/640px-Celeste_box_art_full.png')";

            // Título do jogo
            const title = document.createElement('h3');
            title.classList.add('game-title');
            title.innerText = game.title;

            card.appendChild(title);
            gamesGrid.appendChild(card);
        });
    }

    // --- Lógica do Formulário (Página Cadastro) ---
    const formCadastro = document.getElementById('personalInfoForm'); // Ajustado para o ID correto do form
    const btnLimpar = document.getElementById('btnLimpar');
    const btnEnviar = document.getElementById('btnEnviar');

    if (formCadastro) {
        // Botão Limpar
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                const confirmClear = confirm("Deseja realmente limpar todos os campos?");
                if (confirmClear) {
                    formCadastro.reset();
                    // Limpa também o formulário de endereço se existir na mesma página
                    const addressForm = document.getElementById('addressForm');
                    if(addressForm) addressForm.reset();
                }
            });
        }

        // Evento de Envio
        formCadastro.addEventListener('submit', (event) => {
            event.preventDefault(); // Impede o envio real
            
            // Captura nome apenas para exemplo
            const nomeInput = document.getElementById('nome');
            const nome = nomeInput ? nomeInput.value : 'Visitante';
            
            alert(`Obrigado, ${nome}! Seu cadastro foi simulado com sucesso.`);
            
            formCadastro.reset();
            const addressForm = document.getElementById('addressForm');
            if(addressForm) addressForm.reset();
        });
    }
});