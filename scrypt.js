document.addEventListener('DOMContentLoaded', () => {
    
    // Lista de jogos (Simulando um banco de dados)
    const gamesData = [
        { id: 1, title: 'Celeste', color: '#5CC75C' },
        { id: 2, title: 'Celeste', color: '#C8A2FF' },
        { id: 3, title: 'Celeste', color: '#5CC75C' },
        { id: 4, title: 'Celeste', color: '#C8A2FF' },
        { id: 5, title: 'Celeste', color: '#5CC75C' },
        { id: 6, title: 'Celeste', color: '#C8A2FF' },
        { id: 7, title: 'Celeste', color: '#5CC75C' },
        { id: 8, title: 'Celeste', color: '#C8A2FF' },
        { id: 9, title: 'Celeste', color: '#5CC75C' },
        { id: 10, title: 'Celeste', color: '#5CC75C' } // Último centralizado
    ];

    const gridContainer = document.getElementById('gamesGrid');

    // Função para renderizar os cards
    gamesData.forEach(game => {
        // Criar elemento div
        const card = document.createElement('div');
        card.classList.add('game-card');
        
        // Usei placeholders coloridos para simular as capas diferentes
        // Na prática, você usaria: src="${game.imagem}"
        const imageUrl = `https://placehold.co/300x300/${game.color.replace('#', '')}/ffffff?text=${game.title}`;

        card.innerHTML = `
            <img src="${imageUrl}" alt="${game.title}">
            <div class="game-title-overlay">${game.title}</div>
        `;

        gridContainer.appendChild(card);
    });

    console.log('Jogos carregados com sucesso!');
});

// --- CÓDIGO DA PÁGINA DE CADASTRO ---

// Verifica se estamos na página de cadastro para evitar erros na Home
if (document.getElementById('cadastroForm')) {
    
    const senhaInput = document.getElementById('senha');
    const senhaConfirmInput = document.getElementById('senha-confirm');
    const matchError = document.getElementById('match-error');

    // Elementos de validação
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');

    // 1. Validação em Tempo Real da Senha
    senhaInput.addEventListener('input', () => {
        const val = senhaInput.value;

        // Valida 10 caracteres
        if (val.length >= 10) setValid(reqLength, true);
        else setValid(reqLength, false);

        // Valida Letra Maiúscula
        if (/[A-Z]/.test(val)) setValid(reqUpper, true);
        else setValid(reqUpper, false);

        // Valida Número
        if (/[0-9]/.test(val)) setValid(reqNumber, true);
        else setValid(reqNumber, false);

        // Valida Caracteres Especiais (*, ;, #)
        if (/[*;#]/.test(val)) setValid(reqSpecial, true);
        else setValid(reqSpecial, false);
    });

    // 2. Validação da Confirmação de Senha
    senhaConfirmInput.addEventListener('input', () => {
        if (senhaConfirmInput.value === senhaInput.value && senhaInput.value !== "") {
            matchError.classList.remove('invalid');
            matchError.classList.add('valid');
            matchError.textContent = "As senhas conferem!";
        } else {
            matchError.classList.remove('valid');
            matchError.classList.add('invalid');
            matchError.textContent = "A senha digitada deve ser igual a anterior.";
        }
    });

    // Função auxiliar para trocar classe CSS
    function setValid(element, isValid) {
        if (isValid) {
            element.classList.remove('invalid');
            element.classList.add('valid');
        } else {
            element.classList.remove('valid');
            element.classList.add('invalid');
        }
    }

    // 3. Botão Limpar
    document.getElementById('btnLimpar').addEventListener('click', () => {
        document.getElementById('cadastroForm').reset();
        // Reseta as cores das validações para vermelho (erro)
        [reqLength, reqUpper, reqNumber, reqSpecial, matchError].forEach(el => {
            el.classList.remove('valid');
            el.classList.add('invalid');
        });
        matchError.textContent = "A senha digitada deve ser igual a anterior.";
    });

    // 4. Checkbox "Não se aplica" para Número
    const checkSemNumero = document.getElementById('sem-numero');
    const inputNumero = document.getElementById('numero');

    checkSemNumero.addEventListener('change', () => {
        if (checkSemNumero.checked) {
            inputNumero.value = "";
            inputNumero.disabled = true;
            inputNumero.style.backgroundColor = "#e0e0e0"; // Visual de desabilitado
        } else {
            inputNumero.disabled = false;
            inputNumero.style.backgroundColor = "#D9D9D9";
        }
    });
}

// ... (Mantenha o código anterior da Home e do Cadastro aqui) ...

// --- CÓDIGO DA PÁGINA DE LISTAGEM ---

document.addEventListener('DOMContentLoaded', () => {
    
    const membersGrid = document.getElementById('membersGrid');

    if (membersGrid) {
        // Gerando 21 membros para simular as 3 linhas de 7 colunas da imagem
        const totalMembers = 21;
        
        for (let i = 0; i < totalMembers; i++) {
            const memberCard = document.createElement('div');
            memberCard.classList.add('member-card');

            // Foto placeholder genérica de pessoa
            const photoUrl = `https://placehold.co/150x150/e0e0e0/333?text=Foto`;

            memberCard.innerHTML = `
                <img src="${photoUrl}" alt="Foto do membro" class="member-photo">
                <p class="member-name">João da Silva Pereira</p>
            `;

            membersGrid.appendChild(memberCard);
        }
    }
});