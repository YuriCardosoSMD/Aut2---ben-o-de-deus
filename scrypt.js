document.addEventListener('DOMContentLoaded', () => {
    const gamesGrid = document.getElementById('gamesGrid');

    if (!gamesGrid) {
        console.error("Elemento #gamesGrid não encontrado!");
        return;
    }
    
    // Dados simulados (no futuro, isso pode vir de um banco de dados ou JSON)
    const games = [
        { title: "Aventura na Caatinga", color: "green" },
        { title: "Cyber Cangaceiro", color: "purple" },
        { title: "Sertão Racing", color: "green" },
        { title: "Puzzle do Agreste", color: "green" },
        { title: "Mistério em Cordel", color: "purple" },
        { title: "Festa Junina Tycoon", color: "green" }
    ];

    games.forEach((game, index) => {
        const card = document.createElement('div');
        card.classList.add('game-card');
        
        // Define a cor da borda baseada nos dados ou na lógica (alternada)
        if (game.color === 'purple') {
            card.classList.add('card-purple');
        } else {
            card.classList.add('card-green');
        }

        // Imagem de placeholder (substitua pelas imagens reais)
        // Usando placehold.co para gerar imagens com texto
        const imageUrl = `https://placehold.co/300x400/333/FFF?text=${encodeURIComponent(game.title)}`;
        card.style.backgroundImage = `url('${imageUrl}')`;

        // Título do jogo
        const title = document.createElement('h3');
        title.classList.add('game-title');
        title.innerText = game.title;

        card.appendChild(title);
        gamesGrid.appendChild(card);
    });
});

// ... (mantenha o código existente da home)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica da Página de Cadastro ---
    const formCadastro = document.getElementById('formCadastro');
    const btnLimpar = document.getElementById('btnLimpar');

    if (formCadastro) {
        // Função do botão Limpar
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                const confirmClear = confirm("Deseja realmente limpar todos os campos?");
                if (confirmClear) {
                    formCadastro.reset();
                }
            });
        }

        // Função do botão Enviar (Submit)
        formCadastro.addEventListener('submit', (event) => {
            event.preventDefault(); // Impede o envio real para fins de demonstração

            // Captura os dados
            const formData = new FormData(formCadastro);
            const nome = formData.get('nome');
            const email = formData.get('email');
            const autorizacao = formData.get('autorizacao');

            // Exemplo de ação
            console.log("Dados do Formulário:", { nome, email, autorizacao });
            
            alert(`Obrigado, ${nome}! Seu cadastro foi realizado com sucesso.\n(Autorização de imagem: ${autorizacao})`);
            
            formCadastro.reset();
        });
    }
});