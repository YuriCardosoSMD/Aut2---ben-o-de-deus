document.addEventListener('DOMContentLoaded', () => {
    
    // Seleção de elementos da página de Listagem
    const usersGrid = document.querySelector('.users-grid');

    // Seleção de elementos da página de Cadastro
    const form = document.getElementById('cadastroForm');
    const cepInput = document.getElementById('cep');
    const btnLimpar = document.getElementById('btnLimpar');
    const chkSemNumero = document.getElementById('sem-numero');
    const numInput = document.getElementById('numero');
    
    // Elementos de Senha
    const senhaInput = document.getElementById('senha');
    const toggleSenhaBtn = document.getElementById('toggleSenha');
    const senhaConfirmInput = document.getElementById('senha-confirm');
    const toggleSenhaConfirmBtn = document.getElementById('toggleSenhaConfirm');
    
    // Elementos de Feedback Visual (Requisitos de Senha)
    const reqIguais = document.getElementById('req-iguais');
    const reqTamanho = document.getElementById('req-tamanho');
    const reqMaiuscula = document.getElementById('req-maiuscula');
    const reqNumero = document.getElementById('req-numero');
    const reqEspecial = document.getElementById('req-especial');

    // Funções Auxiliares ---------------------------------------------------

    // Altera a cor do texto de validação (Verde para OK, Vermelho para Erro)
    function setStatus(element, isValid) {
        if (!element) return;
        if (isValid) {
            element.classList.remove('error-text-red');
            element.classList.add('valid-text-green');
        } else {
            element.classList.remove('valid-text-green');
            element.classList.add('error-text-red');
        }
    }

    // Verifica se os campos de senha e confirmação são idênticos
    function verificarIgualdade() {
        if (senhaInput && senhaConfirmInput && reqIguais) {
            const s1 = senhaInput.value;
            const s2 = senhaConfirmInput.value;
            const saoIguais = (s1 === s2) && (s1.length > 0);
            setStatus(reqIguais, saoIguais);
        }
    }

    // Busca os usuários no servidor e monta a tabela HTML
    async function carregarUsuarios(pagina) {
        try {
            const container = document.querySelector('.users-grid');
            container.innerHTML = '<p style="color:white; text-align:center;">Carregando dados...</p>';
            container.style.display = 'block'; 

            const res = await fetch(`http://localhost:5000/listar_usurios?page=${pagina}`);
            const data = await res.json();

            if (data.usuarios.length === 0) {
                container.innerHTML = '<p style="color:white; text-align:center;">Nenhum usuário cadastrado.</p>';
                return;
            }

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

            // Botões de navegação da paginação
            html += `
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
                    <button id="btnPrev" style="padding: 8px 16px; cursor: pointer; background: #4AAD4A; border: none; color: white; border-radius: 4px;" ${data.paginaAtual === 1 ? 'disabled style="opacity:0.5"' : ''}>Anterior</button>
                    <span style="color: white; align-self: center;">Página ${data.paginaAtual} de ${data.totalPaginas}</span>
                    <button id="btnNext" style="padding: 8px 16px; cursor: pointer; background: #4AAD4A; border: none; color: white; border-radius: 4px;" ${data.paginaAtual >= data.totalPaginas ? 'disabled style="opacity:0.5"' : ''}>Próxima</button>
                </div>
            `;

            container.innerHTML = html;

            const btnPrev = document.getElementById('btnPrev');
            const btnNext = document.getElementById('btnNext');

            if(btnPrev && !btnPrev.disabled) btnPrev.onclick = () => carregarUsuarios(data.paginaAtual - 1);
            if(btnNext && !btnNext.disabled) btnNext.onclick = () => carregarUsuarios(data.paginaAtual + 1);

        } catch (error) {
            console.error("Erro ao listar:", error);
            document.querySelector('.users-grid').innerHTML = '<p style="color:red; text-align:center;">Erro ao conectar com o servidor.</p>';
        }
    }

    // Lógica da Página de Listagem -----------------------------------------
    if (usersGrid) {
        carregarUsuarios(1);
    }

    // Lógica da Página de Cadastro -----------------------------------------
    
    // Configurações de visibilidade da senha (olho)
    if (senhaInput && toggleSenhaBtn) {
        toggleSenhaBtn.addEventListener('click', () => {
            const tipoAtual = senhaInput.getAttribute('type');
            const novoTipo = tipoAtual === 'password' ? 'text' : 'password';
            senhaInput.setAttribute('type', novoTipo);
            toggleSenhaBtn.style.color = novoTipo === 'text' ? '#4AAD4A' : '#575757';
        });
    }

    if (senhaConfirmInput && toggleSenhaConfirmBtn) {
        toggleSenhaConfirmBtn.addEventListener('click', () => {
            const tipoAtual = senhaConfirmInput.getAttribute('type');
            const novoTipo = tipoAtual === 'password' ? 'text' : 'password';
            senhaConfirmInput.setAttribute('type', novoTipo);
            toggleSenhaConfirmBtn.style.color = novoTipo === 'text' ? '#4AAD4A' : '#575757';
        });
    }

    // Validação em tempo real dos requisitos de senha
    if (senhaInput) {
        senhaInput.addEventListener('input', () => {
            const val = senhaInput.value;
            setStatus(reqTamanho, val.length >= 10);
            setStatus(reqMaiuscula, /[A-Z]/.test(val));
            setStatus(reqNumero, /[0-9]/.test(val));
            setStatus(reqEspecial, /[*;#]/.test(val));
            verificarIgualdade();
        });
    }

    if (senhaConfirmInput) {
        senhaConfirmInput.addEventListener('input', () => {
            verificarIgualdade();
        });
    }

    // Lógica do formulário de cadastro
    if (form) {
        
        // Formatação automática e busca de CEP
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

        // Checkbox para desabilitar o número do endereço
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

        // Botão de limpar: reseta campos e estados visuais
        btnLimpar.addEventListener('click', () => {
            if (confirm("Tem certeza que deseja limpar todos os campos preenchidos?")) {
                form.reset();
                
                if (numInput) {
                    numInput.readOnly = false;
                    numInput.value = ""; 
                }

                if (senhaInput) senhaInput.setAttribute('type', 'password');
                if (senhaConfirmInput) senhaConfirmInput.setAttribute('type', 'password');
                if (toggleSenhaBtn) toggleSenhaBtn.style.color = '#575757';
                if (toggleSenhaConfirmBtn) toggleSenhaConfirmBtn.style.color = '#575757';

                [reqTamanho, reqMaiuscula, reqNumero, reqEspecial, reqIguais].forEach(el => {
                    if (el) {
                        el.classList.remove('valid-text-green');
                        el.classList.add('error-text-red');
                    }
                });
            }
        });

        // Envio do formulário com validações finais
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            const nome = formData.get('nome');
            const email = formData.get('email');
            const rua = formData.get('rua');
            const cidade = formData.get('cidade');
            const estado = formData.get('estado');
            const senha = formData.get('senha');
            const senhaConfirm = formData.get('senha_confirm');

            if (!nome || nome.length < 3 || nome.length > 50) {
                alert("O nome deve ter entre 3 e 50 caracteres.");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@\.]+$/;
            if (!emailRegex.test(email)) {
                alert("E-mail inválido! Formato esperado: exemplo@dominio.com");
                return;
            }

            if (rua.length < 4) { alert("O endereço (Rua) deve ter no mínimo 4 caracteres."); return; }
            if (cidade.length < 3) { alert("A cidade deve ter no mínimo 3 caracteres."); return; }
            if (estado.length !== 2) { alert("O estado deve ter exatamente 2 caracteres (Sigla)."); return; }

            if (senha.length < 10) {
                alert("A senha deve ter no mínimo 10 caracteres.");
                return;
            }
            if (senha !== senhaConfirm) {
                alert("As senhas não conferem!");
                return;
            }

            const temLetra = /[a-zA-Z]/.test(senha);
            const temNumero = /[0-9]/.test(senha);
            const temEspecial = /[*;#]/.test(senha);

            if (!temLetra || !temNumero || !temEspecial) {
                alert("A senha deve conter Letras, Números e pelo menos um caractere especial (*, ; ou #).");
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/cadastrar_usuario', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Usuário cadastrado com sucesso!");

                    const mainContent = document.getElementById('main-content');
                    const jsonOutput = JSON.stringify(result.usuario, null, 4);
                    
                    mainContent.innerHTML = `
                        <section class="container" style="padding: 100px 20px; text-align: center;">
                            <h2 style="font-size: 32px; color: var(--primary-green); margin-bottom: 20px;">Dados Submetidos com Sucesso!</h2>
                            <div style="background: #111; padding: 20px; border-radius: 8px; text-align: left; display: inline-block; max-width: 100%; overflow-x: auto;">
                                <pre style="color: #0f0; font-family: monospace;">${jsonOutput}</pre>
                            </div>
                            <br><br>
                            <a href="listagem.html" class="btn-signup" style="display: inline-block;">Ver Listagem</a>
                            <a href="cadastro.html" class="btn-primary" style="margin-left: 20px;">Novo Cadastro</a>
                        </section>
                    `;
                    window.scrollTo(0, 0);

                } else {
                    alert("Erro do Servidor: " + result.error);
                }
            } catch (error) {
                console.error("Erro de envio:", error);
                alert("Falha na conexão com o servidor.");
            }
        });
    }
});