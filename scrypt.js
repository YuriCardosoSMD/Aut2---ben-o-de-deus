document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA LISTAGEM DE USUÁRIOS (Questão 4) ---
    const usersGrid = document.querySelector('.users-grid');
    // Verifica se estamos na página de listagem
    if (usersGrid) {
        carregarUsuarios(1); // Carrega a primeira página ao iniciar
    }

    async function carregarUsuarios(pagina) {
        try {
            const container = document.querySelector('.users-grid');
            // Substitui o grid visual por uma tabela ou loading
            container.innerHTML = '<p style="color:white; text-align:center;">Carregando dados...</p>';
            
            // Estilo temporário para transformar o grid em container de tabela
            container.style.display = 'block'; 

            const res = await fetch(`http://localhost:3000/listar_usurios?page=${pagina}`);
            const data = await res.json();

            if (data.usuarios.length === 0) {
                container.innerHTML = '<p style="color:white; text-align:center;">Nenhum usuário cadastrado.</p>';
                return;
            }

            // Monta a Tabela HTML
            let html = `
                <div style="overflow-x:auto;">
                    <table style="width: 100%; border-collapse: collapse; color: #fff; background: #1e1e1e; border-radius: 8px; overflow: hidden;">
                        <thead>
                            <tr style="background: #4AAD4A; text-align: left;">
                                <th style="padding: 12px;">Foto</th>
                                <th style="padding: 12px;">Nome</th>
                                <th style="padding: 12px;">Email</th>
                                <th style="padding: 12px;">Endereço</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            data.usuarios.forEach(user => {
                html += `
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding: 10px;">
                            <img src="${user.foto}" alt="Foto" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">
                        </td>
                        <td style="padding: 10px;">${user.nome}</td>
                        <td style="padding: 10px;">${user.email}</td>
                        <td style="padding: 10px;">${user.endereco}</td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;

            // Controles de Paginação
            html += `
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
                    <button id="btnPrev" style="padding: 8px 16px; cursor: pointer; background: #4AAD4A; border: none; color: white; border-radius: 4px;" ${data.paginaAtual === 1 ? 'disabled style="opacity:0.5"' : ''}>Anterior</button>
                    <span style="color: white; align-self: center;">Página ${data.paginaAtual} de ${data.totalPaginas}</span>
                    <button id="btnNext" style="padding: 8px 16px; cursor: pointer; background: #4AAD4A; border: none; color: white; border-radius: 4px;" ${data.paginaAtual >= data.totalPaginas ? 'disabled style="opacity:0.5"' : ''}>Próxima</button>
                </div>
            `;

            container.innerHTML = html;

            // Eventos dos botões de paginação
            const btnPrev = document.getElementById('btnPrev');
            const btnNext = document.getElementById('btnNext');

            if(btnPrev && !btnPrev.disabled) {
                btnPrev.onclick = () => carregarUsuarios(data.paginaAtual - 1);
            }
            if(btnNext && !btnNext.disabled) {
                btnNext.onclick = () => carregarUsuarios(data.paginaAtual + 1);
            }

        } catch (error) {
            console.error("Erro ao listar:", error);
            document.querySelector('.users-grid').innerHTML = '<p style="color:red; text-align:center;">Erro ao conectar com o servidor.</p>';
        }
    }


    // --- LÓGICA DO FORMULÁRIO (Questão 1, 2 e 4 - Upload) ---
    const form = document.getElementById('cadastroForm');
    const cepInput = document.getElementById('cep');
    const btnLimpar = document.getElementById('btnLimpar');
    const chkSemNumero = document.getElementById('sem-numero');
    const numInput = document.getElementById('numero');

    if (form) {
        
        // Integração API de CEP
        cepInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, ''); 
            if (val.length > 8) val = val.slice(0, 8);
            if (val.length > 5) val = val.substring(0, 5) + '-' + val.substring(5);
            e.target.value = val;
        });

        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            if (cep.length === 8) {
                try {
                    document.getElementById('rua').value = "Carregando...";
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    if (!data.erro) {
                        document.getElementById('rua').value = data.logradouro;
                        document.getElementById('bairro').value = data.bairro;
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('estado').value = data.uf;
                        numInput.focus();
                    } else {
                        alert("CEP não encontrado!");
                        document.getElementById('rua').value = "";
                    }
                } catch (e) {
                    console.error("Erro no ViaCEP", e);
                }
            }
        });

        if(chkSemNumero) {
            chkSemNumero.addEventListener('change', (e) => {
                if(e.target.checked) {
                    numInput.value = "SN";
                    numInput.readOnly = true;
                } else {
                    numInput.value = "";
                    numInput.readOnly = false;
                }
            });
        }

        btnLimpar.addEventListener('click', () => {
            if(confirm("Deseja limpar todos os campos?")) form.reset();
        });

        // --- SUBMIT DO FORMULÁRIO (COM UPLOAD) ---
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validações básicas (simplificadas para focar no envio)
            const formData = new FormData(form); // Captura campos de texto e arquivos automaticamente

            // Validação de Senha (igual a original)
            const senha = formData.get('senha');
            const senhaConfirm = formData.get('senha_confirm');
            
            if (senha !== senhaConfirm) {
                alert("As senhas não conferem!");
                return;
            }
            if (senha.length < 10) {
                alert("Senha deve ter no mínimo 10 caracteres.");
                return;
            }

            try {
                // Envia para o backend (Endpoint criado no server.js)
                const response = await fetch('http://localhost:3000/cadastro', {
                    method: 'POST',
                    body: formData // Não precisa de headers, o browser define o boundary do multipart
                });

                if (response.ok) {
                    const result = await response.json();
                    alert("Usuário cadastrado com sucesso!");
                    
                    // Redireciona para a listagem ou limpa
                    if(confirm("Deseja ver a lista de usuários agora?")) {
                        window.location.href = 'listagem.html';
                    } else {
                        form.reset();
                    }
                } else {
                    alert("Erro ao cadastrar no servidor.");
                }
            } catch (error) {
                console.error("Erro de envio:", error);
                alert("Falha na conexão com o servidor.");
            }
        });
    }
});