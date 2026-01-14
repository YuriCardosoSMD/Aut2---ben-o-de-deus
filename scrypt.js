document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA LISTAGEM DE USUÁRIOS (Existente) ---
    const usersGrid = document.querySelector('.users-grid');
    if (usersGrid) {
        // Apenas exemplo, evita erro se não houver backend
        fetch('/listar_usurios').catch(() => []); 
    }

    // --- LÓGICA DO FORMULÁRIO (Questão 1 e 2) ---
    const form = document.getElementById('cadastroForm');
    const cepInput = document.getElementById('cep');
    const btnLimpar = document.getElementById('btnLimpar');
    const chkSemNumero = document.getElementById('sem-numero');
    const numInput = document.getElementById('numero');

    if (form) {
        
        /* ==================================================================
           QUESTÃO 2: INTEGRAÇÃO API DE CEP E PREENCHIMENTO AUTOMÁTICO
           ================================================================== */
        
        // 1. Máscara do CEP (00000-000) enquanto digita
        cepInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, ''); // Remove letras/símbolos
            
            if (val.length > 8) val = val.slice(0, 8); // Trava em 8 dígitos

            if (val.length > 5) {
                val = val.substring(0, 5) + '-' + val.substring(5); // Adiciona hífen
            }
            e.target.value = val;
        });

        // 2. Busca na API ViaCEP ao sair do campo (evento 'blur')
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                try {
                    // Aviso visual de carregamento
                    document.getElementById('rua').value = "Buscando endereço...";
                    document.getElementById('cidade').value = "...";
                    
                    // Chamada à API Pública
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    
                    if (!data.erro) {
                        // Preenche os campos automaticamente
                        document.getElementById('rua').value = data.logradouro;
                        document.getElementById('bairro').value = data.bairro;
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('estado').value = data.uf;
                        
                        // Remove erros visuais caso existam
                        ['rua', 'bairro', 'cidade', 'estado'].forEach(id => {
                            document.getElementById(id).classList.remove('input-error');
                        });

                        // Foca no campo NÚMERO (obrigatório)
                        numInput.focus();
                    } else {
                        alert("CEP não encontrado na base de dados!");
                        document.getElementById('rua').value = "";
                        document.getElementById('cidade').value = "";
                    }
                } catch (e) {
                    console.error("Erro na requisição ViaCEP", e);
                    alert("Erro ao conectar com o serviço de CEP.");
                    document.getElementById('rua').value = "";
                }
            }
        });

        // 3. Lógica do Checkbox "Não se aplica" (Sem Número)
        if(chkSemNumero) {
            chkSemNumero.addEventListener('change', (e) => {
                if(e.target.checked) {
                    numInput.value = "SN";       // Preenche com SN
                    numInput.readOnly = true;    // Bloqueia edição
                    numInput.classList.remove('input-error'); // Remove erro visual
                    numInput.style.backgroundColor = "#e0e0e0";
                } else {
                    numInput.value = "";         // Limpa
                    numInput.readOnly = false;   // Libera edição
                    numInput.style.backgroundColor = "#C3C3C3"; // Volta cor original
                }
            });
        }

        /* ==================================================================
           QUESTÃO 1: VALIDAÇÕES E BOTÕES
           ================================================================== */

        // Botão Limpar
        btnLimpar.addEventListener('click', () => {
            if(confirm("Tem certeza que deseja limpar todos os campos?")) {
                form.reset();
                document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));
                
                // Reseta visual do campo número
                if(numInput.readOnly) {
                    numInput.readOnly = false;
                    numInput.style.backgroundColor = "#C3C3C3";
                }
            }
        });

        // Evento de Enviar (Submit) com Validação Completa
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const dados = Object.fromEntries(formData);
            let erros = [];

            // Função para marcar erro visualmente
            const marcarErro = (id) => {
                const el = document.getElementById(id);
                if(el) el.classList.add('input-error');
            };

            // Limpa erros anteriores
            document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));

            // --- Regras de Validação ---

            // Nome
            if (!dados.nome || dados.nome.trim().length < 3 || dados.nome.length > 50) {
                erros.push("Nome: Entre 3 e 50 caracteres.");
                marcarErro('nome');
            }

            // E-mail (Formato rigoroso)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailRegex.test(dados.email)) {
                erros.push("E-mail: Formato inválido (ex: joao@site.com).");
                marcarErro('email');
            }

            // Endereço (Rua)
            if (!dados.rua || dados.rua.trim().length < 4) {
                erros.push("Rua: Mínimo de 4 caracteres.");
                marcarErro('rua');
            }

            // Número (QUESTÃO 2: Obrigatório ou SN)
            if (!dados.numero || dados.numero.trim() === "") {
                erros.push("Número: Campo obrigatório (ou marque 'Não se aplica').");
                marcarErro('numero');
            }

            // CEP
            const cepLimpo = dados.cep.replace(/\D/g, '');
            if (cepLimpo.length !== 8) {
                erros.push("CEP: Formato inválido (8 dígitos).");
                marcarErro('cep');
            }

            // Cidade
            if (!dados.cidade || dados.cidade.trim().length < 3) {
                erros.push("Cidade: Mínimo de 3 caracteres.");
                marcarErro('cidade');
            }

            // Estado
            if (!dados.estado || dados.estado.trim().length !== 2) {
                erros.push("Estado: Use a sigla (ex: CE).");
                marcarErro('estado');
            }

            // Senha (Complexa)
            const senha = dados.senha;
            const validacaoSenha = 
                senha.length >= 10 &&
                /[a-zA-Z]/.test(senha) &&     // Tem letra
                /[0-9]/.test(senha) &&        // Tem número
                /[*;#]/.test(senha) &&        // Tem especial permitido
                !/[^a-zA-Z0-9*;#]/.test(senha); // NÃO tem caractere proibido

            if (!validacaoSenha) {
                erros.push("Senha: Min 10 caracteres, letras, números e apenas (* ; #).");
                marcarErro('senha');
            }

            // Repetir Senha
            if (dados.senha !== dados.senha_confirm) {
                erros.push("Confirmação de Senha: As senhas não conferem.");
                marcarErro('senha-confirm');
            }

            // --- Decisão Final ---
            if (erros.length > 0) {
                alert("Erros encontrados:\n\n- " + erros.join("\n- "));
            } else {
                exibirJSONNaTela(dados);
            }
        });
    }

    // Função de Sucesso (Exibe JSON)
    function exibirJSONNaTela(dados) {
        delete dados.senha_confirm; // Remove redundância

        document.body.innerHTML = ''; // Limpa tela
        
        // Estilos do container de sucesso
        document.body.style.backgroundColor = '#0d0d0d';
        document.body.style.color = '#4AAD4A';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.minHeight = '100vh';
        document.body.style.fontFamily = "'Courier New', monospace";

        const title = document.createElement('h1');
        title.innerText = "> CADASTRO REALIZADO_";

        const code = document.createElement('pre');
        code.style.background = '#1e1e1e';
        code.style.padding = '20px';
        code.style.border = '1px solid #4AAD4A';
        code.style.borderRadius = '5px';
        code.innerText = JSON.stringify(dados, null, 4);

        const btn = document.createElement('button');
        btn.innerText = "VOLTAR";
        btn.style.marginTop = '20px';
        btn.style.padding = '10px 30px';
        btn.style.background = '#4AAD4A';
        btn.style.border = 'none';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        btn.onclick = () => window.location.reload();

        document.body.appendChild(title);
        document.body.appendChild(code);
        document.body.appendChild(btn);
    }
});