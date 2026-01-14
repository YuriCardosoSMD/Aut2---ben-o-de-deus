document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA LISTAGEM DE USUÁRIOS (Existente) ---
    const usersGrid = document.querySelector('.users-grid');
    if (usersGrid) {
        // Tenta buscar usuários
        fetch('/listar_usurios').catch(() => []); 
    }

    // --- LÓGICA DO FORMULÁRIO (Questão 1 e 2) ---
    const form = document.getElementById('cadastroForm');
    const cepInput = document.getElementById('cep');
    const btnLimpar = document.getElementById('btnLimpar');
    const chkSemNumero = document.getElementById('sem-numero');
    const numInput = document.getElementById('numero');

    if (form) {
        
        // === Questão 2: Integração API de CEP & Máscara ===
        
        // Máscara 00000-000 aplicada ao digitar
        cepInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, ''); // Remove não números
            
            // Limita a 8 dígitos numéricos no total para a lógica
            if (val.length > 8) val = val.slice(0, 8);

            // Adiciona o hífen visualmente
            if (val.length > 5) {
                val = val.substring(0, 5) + '-' + val.substring(5);
            }
            e.target.value = val;
        });

        // Busca na API ViaCEP ao sair do campo (blur)
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                try {
                    // Feedback visual de carregamento
                    document.getElementById('rua').value = "Carregando...";
                    
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    
                    if (!data.erro) {
                        document.getElementById('rua').value = data.logradouro;
                        document.getElementById('bairro').value = data.bairro;
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('estado').value = data.uf;
                        
                        // Foca no número
                        numInput.focus();
                        
                        // Remove erros visuais dos campos preenchidos
                        ['rua', 'bairro', 'cidade', 'estado'].forEach(id => {
                            document.getElementById(id).classList.remove('input-error');
                        });
                    } else {
                        alert("CEP não encontrado!");
                        document.getElementById('rua').value = "";
                    }
                } catch (e) {
                    console.error("Erro no ViaCEP", e);
                    alert("Erro ao consultar CEP.");
                }
            }
        });

        // Lógica Checkbox "Sem Número"
        if(chkSemNumero) {
            chkSemNumero.addEventListener('change', (e) => {
                if(e.target.checked) {
                    numInput.value = "SN";
                    numInput.readOnly = true;
                    // Remove erro visual se houver
                    numInput.classList.remove('input-error');
                    numInput.style.border = "none";
                } else {
                    numInput.value = "";
                    numInput.readOnly = false;
                }
            });
        }

        // === Questão 1: Botões e Validação ===

        // Botão Limpar
        btnLimpar.addEventListener('click', () => {
            if(confirm("Deseja realmente limpar todos os campos?")) {
                form.reset();
                // Reseta estado visual de erros
                document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));
                // Reseta estado do campo número se necessário
                if(numInput.readOnly) {
                    numInput.readOnly = false;
                }
            }
        });

        // Enviar com Validação
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio padrão

            const formData = new FormData(form);
            const dados = Object.fromEntries(formData);
            let erros = [];

            // Função auxiliar para marcar campo com erro
            const marcarErro = (id) => {
                const el = document.getElementById(id);
                if(el) el.classList.add('input-error');
            };

            // Limpa erros visuais antes de validar
            document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));

            // 1. Validação Nome (Min 3 e Max 50)
            if (!dados.nome || dados.nome.trim().length < 3 || dados.nome.length > 50) {
                erros.push("Nome: Deve ter entre 3 e 50 caracteres.");
                marcarErro('nome');
            }

            // 2. Validação E-mail (Formato estrito ccc@ddd.ccc)
            // Regex: caracteres + @ + caracteres + . + caracteres (pelo menos 2)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailRegex.test(dados.email)) {
                erros.push("E-mail: Formato inválido. Ex: nome@dominio.com");
                marcarErro('email');
            }

            // 3. Endereço (Rua) - Mínimo 4 caracteres
            if (!dados.rua || dados.rua.trim().length < 4) {
                erros.push("Endereço: A rua deve ter no mínimo 4 caracteres.");
                marcarErro('rua');
            }

            // 4. Número (Obrigatório ou SN)
            if (!dados.numero || dados.numero.trim() === "") {
                erros.push("Número: Obrigatório (ou marque 'Não se aplica').");
                marcarErro('numero');
            }

            // 5. CEP (Formato 00000-000)
            const cepLimpo = dados.cep.replace(/\D/g, '');
            if (cepLimpo.length !== 8) {
                erros.push("CEP: Deve conter 8 dígitos.");
                marcarErro('cep');
            }

            // 6. Cidade - Mínimo 3 caracteres
            if (!dados.cidade || dados.cidade.trim().length < 3) {
                erros.push("Cidade: Mínimo de 3 caracteres.");
                marcarErro('cidade');
            }

            // 7. Estado - Exatamente 2 caracteres
            if (!dados.estado || dados.estado.trim().length !== 2) {
                erros.push("Estado: Deve conter exatamente a sigla de 2 letras (ex: CE).");
                marcarErro('estado');
            }

            // 8. Senha
            // Min 10 chars, Letras, Números, Especiais APENAS (* ; #)
            const senha = dados.senha;
            const temTamanho = senha.length >= 10;
            const temLetra = /[a-zA-Z]/.test(senha);
            const temNumero = /[0-9]/.test(senha);
            const temEspecialValido = /[*;#]/.test(senha); // Tem que ter pelo menos um desses
            // Verifica se tem algo que NÃO seja letra, número ou (*;#)
            const temCaractereInvalido = /[^a-zA-Z0-9*;#]/.test(senha);

            if (!temTamanho || !temLetra || !temNumero || !temEspecialValido) {
                erros.push("Senha: Requisitos não atendidos (Min 10 chars, letras, números e especiais * ; #).");
                marcarErro('senha');
            } else if (temCaractereInvalido) {
                erros.push("Senha: Caracteres inválidos detectados. Apenas *, ; e # são permitidos como especiais.");
                marcarErro('senha');
            }

            // 9. Repetir Senha
            if (dados.senha !== dados.senha_confirm) {
                erros.push("Repetir Senha: As senhas não conferem.");
                marcarErro('senha-confirm');
            }

            // --- Resultado da Validação ---
            if (erros.length > 0) {
                alert("Por favor, corrija os erros:\n\n- " + erros.join("\n- "));
            } else {
                // SUCESSO!
                exibirJSONNaTela(dados);
            }
        });
    }

    // Função para limpar a tela e mostrar JSON (Requisito Questão 1)
    function exibirJSONNaTela(dados) {
        // Remove campos desnecessários para o JSON final
        delete dados.senha_confirm;

        // Limpa o conteúdo visual da página
        document.body.innerHTML = '';
        
        // Cria container estilo "Console Hacker"
        document.body.style.backgroundColor = '#0d0d0d';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0';
        document.body.style.fontFamily = "'Courier New', monospace";

        const container = document.createElement('div');
        container.style.width = '80%';
        container.style.maxWidth = '800px';
        container.style.backgroundColor = '#1e1e1e';
        container.style.border = '2px solid #4AAD4A';
        container.style.borderRadius = '10px';
        container.style.padding = '30px';
        container.style.boxShadow = '0 0 20px rgba(74, 173, 74, 0.2)';
        
        const titulo = document.createElement('h2');
        titulo.innerText = '> DADOS ENVIADOS COM SUCESSO_';
        titulo.style.color = '#4AAD4A';
        titulo.style.textAlign = 'center';
        titulo.style.marginBottom = '20px';

        const pre = document.createElement('pre');
        pre.style.color = '#f0f0f0';
        pre.style.fontSize = '16px';
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordBreak = 'break-all';
        
        // Converte objeto para JSON string identada
        pre.innerText = JSON.stringify(dados, null, 4);

        const btnVoltar = document.createElement('a');
        btnVoltar.innerText = '[ VOLTAR PARA O INÍCIO ]';
        btnVoltar.href = 'cadastro.html'; 
        btnVoltar.style.display = 'block';
        btnVoltar.style.marginTop = '30px';
        btnVoltar.style.textAlign = 'center';
        btnVoltar.style.color = '#4AAD4A';
        btnVoltar.style.textDecoration = 'none';
        btnVoltar.style.fontWeight = 'bold';
        btnVoltar.style.cursor = 'pointer';

        container.appendChild(titulo);
        container.appendChild(pre);
        container.appendChild(btnVoltar);
        document.body.appendChild(container);
    }
});