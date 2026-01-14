document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA LISTAGEM DE USUÁRIOS (Existente) ---
    const usersGrid = document.querySelector('.users-grid');
    if (usersGrid) {
        fetch('/listar_usurios').catch(() => []); 
    }

    // --- LÓGICA DO FORMULÁRIO (Questões 1, 2 e 3) ---
    const form = document.getElementById('cadastroForm');
    const cepInput = document.getElementById('cep');
    const btnLimpar = document.getElementById('btnLimpar');
    const chkSemNumero = document.getElementById('sem-numero');
    const numInput = document.getElementById('numero');

    if (form) {
        
        /* ==================================================================
           QUESTÃO 2: INTEGRAÇÃO API DE CEP E PREENCHIMENTO AUTOMÁTICO
           ================================================================== */
        
        // 1. Máscara do CEP (00000-000)
        cepInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, ''); 
            if (val.length > 8) val = val.slice(0, 8);
            if (val.length > 5) {
                val = val.substring(0, 5) + '-' + val.substring(5);
            }
            e.target.value = val;
        });

        // 2. Busca na API ViaCEP
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                try {
                    document.getElementById('rua').value = "Buscando endereço...";
                    document.getElementById('cidade').value = "...";
                    
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    
                    if (!data.erro) {
                        document.getElementById('rua').value = data.logradouro;
                        document.getElementById('bairro').value = data.bairro;
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('estado').value = data.uf;
                        
                        ['rua', 'bairro', 'cidade', 'estado'].forEach(id => {
                            document.getElementById(id).classList.remove('input-error');
                        });
                        numInput.focus();
                    } else {
                        alert("CEP não encontrado!");
                        document.getElementById('rua').value = "";
                        document.getElementById('cidade').value = "";
                    }
                } catch (e) {
                    console.error("Erro ViaCEP", e);
                    alert("Erro ao consultar CEP.");
                    document.getElementById('rua').value = "";
                }
            }
        });

        // 3. Lógica "Sem Número"
        if(chkSemNumero) {
            chkSemNumero.addEventListener('change', (e) => {
                if(e.target.checked) {
                    numInput.value = "SN";
                    numInput.readOnly = true;
                    numInput.classList.remove('input-error');
                    numInput.style.backgroundColor = "#e0e0e0";
                } else {
                    numInput.value = "";
                    numInput.readOnly = false;
                    numInput.style.backgroundColor = "#C3C3C3";
                }
            });
        }

        /* ==================================================================
           QUESTÃO 1: VALIDAÇÕES & QUESTÃO 3: INTEGRAÇÃO BACKEND
           ================================================================== */

        btnLimpar.addEventListener('click', () => {
            if(confirm("Tem certeza que deseja limpar todos os campos?")) {
                form.reset();
                document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));
                if(numInput.readOnly) {
                    numInput.readOnly = false;
                    numInput.style.backgroundColor = "#C3C3C3";
                }
            }
        });

        // Evento de Enviar modificado para Questão 3
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const dados = Object.fromEntries(formData);
            let erros = [];

            const marcarErro = (id) => {
                const el = document.getElementById(id);
                if(el) el.classList.add('input-error');
            };
            document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));

            // --- Validação Frontend (Questão 1) ---
            if (!dados.nome || dados.nome.trim().length < 3 || dados.nome.length > 50) {
                erros.push("Nome: Entre 3 e 50 caracteres.");
                marcarErro('nome');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailRegex.test(dados.email)) {
                erros.push("E-mail: Formato inválido.");
                marcarErro('email');
            }
            if (!dados.rua || dados.rua.trim().length < 4) {
                erros.push("Rua: Mínimo de 4 caracteres.");
                marcarErro('rua');
            }
            if (!dados.numero || dados.numero.trim() === "") {
                erros.push("Número: Obrigatório.");
                marcarErro('numero');
            }
            const cepLimpo = dados.cep.replace(/\D/g, '');
            if (cepLimpo.length !== 8) {
                erros.push("CEP: Formato inválido.");
                marcarErro('cep');
            }
            if (!dados.cidade || dados.cidade.trim().length < 3) {
                erros.push("Cidade: Mínimo de 3 caracteres.");
                marcarErro('cidade');
            }
            if (!dados.estado || dados.estado.trim().length !== 2) {
                erros.push("Estado: Use a sigla (ex: CE).");
                marcarErro('estado');
            }
            
            const senha = dados.senha;
            const validacaoSenha = 
                senha.length >= 10 &&
                /[a-zA-Z]/.test(senha) &&     
                /[0-9]/.test(senha) &&        
                /[*;#]/.test(senha) &&        
                !/[^a-zA-Z0-9*;#]/.test(senha); 

            if (!validacaoSenha) {
                erros.push("Senha: Min 10 chars, letras, núm e especiais (* ; #).");
                marcarErro('senha');
            }
            if (dados.senha !== dados.senha_confirm) {
                erros.push("Confirmação: Senhas não conferem.");
                marcarErro('senha-confirm');
            }

            // --- Decisão: Se Frontend OK -> Enviar p/ Backend (Questão 3) ---
            if (erros.length > 0) {
                alert("Erros no formulário (Frontend):\n\n- " + erros.join("\n- "));
            } else {
                
                // Exibe feedback de "Enviando..."
                const btnSubmit = document.getElementById('btnEnviar');
                const textoOriginal = btnSubmit.innerHTML;
                btnSubmit.innerText = "Enviando...";
                btnSubmit.disabled = true;

                try {
                    // Envia para o Backend na porta 5000
                    const response = await fetch('http://localhost:5000/cadastrarusr', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(dados)
                    });

                    const result = await response.json();

                    if (response.status === 200) {
                        // Sucesso: 200 OK
                        exibirJSONNaTela(dados);
                    } else {
                        // Erro: 500 (SQL Injection ou Validação Backend)
                        let msgErro = "Erro no Servidor:\n";
                        if (result.detalhes) {
                            msgErro += "- " + result.detalhes.join("\n- ");
                        } else if (result.erro) {
                            msgErro += result.erro;
                        }
                        alert(msgErro);
                    }

                } catch (error) {
                    console.error("Erro na requisição:", error);
                    alert("Erro ao conectar com o servidor (Verifique se o backend está rodando).");
                } finally {
                    // Restaura botão
                    btnSubmit.innerHTML = textoOriginal;
                    btnSubmit.disabled = false;
                }
            }
        });
    }

    function exibirJSONNaTela(dados) {
        delete dados.senha_confirm; 
        document.body.innerHTML = ''; 
        
        document.body.style.backgroundColor = '#0d0d0d';
        document.body.style.color = '#4AAD4A';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.minHeight = '100vh';
        document.body.style.fontFamily = "'Courier New', monospace";

        const title = document.createElement('h1');
        title.innerText = "> CADASTRO REALIZADO (SERVER 200 OK)_";

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
});document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA LISTAGEM DE USUÁRIOS (Existente) ---
    const usersGrid = document.querySelector('.users-grid');
    if (usersGrid) {
        fetch('/listar_usurios').catch(() => []); 
    }

    // --- LÓGICA DO FORMULÁRIO (Questões 1, 2 e 3) ---
    const form = document.getElementById('cadastroForm');
    const cepInput = document.getElementById('cep');
    const btnLimpar = document.getElementById('btnLimpar');
    const chkSemNumero = document.getElementById('sem-numero');
    const numInput = document.getElementById('numero');

    if (form) {
        
        /* ==================================================================
           QUESTÃO 2: INTEGRAÇÃO API DE CEP E PREENCHIMENTO AUTOMÁTICO
           ================================================================== */
        
        // 1. Máscara do CEP (00000-000)
        cepInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, ''); 
            if (val.length > 8) val = val.slice(0, 8);
            if (val.length > 5) {
                val = val.substring(0, 5) + '-' + val.substring(5);
            }
            e.target.value = val;
        });

        // 2. Busca na API ViaCEP
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                try {
                    document.getElementById('rua').value = "Buscando endereço...";
                    document.getElementById('cidade').value = "...";
                    
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    
                    if (!data.erro) {
                        document.getElementById('rua').value = data.logradouro;
                        document.getElementById('bairro').value = data.bairro;
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('estado').value = data.uf;
                        
                        ['rua', 'bairro', 'cidade', 'estado'].forEach(id => {
                            document.getElementById(id).classList.remove('input-error');
                        });
                        numInput.focus();
                    } else {
                        alert("CEP não encontrado!");
                        document.getElementById('rua').value = "";
                        document.getElementById('cidade').value = "";
                    }
                } catch (e) {
                    console.error("Erro ViaCEP", e);
                    alert("Erro ao consultar CEP.");
                    document.getElementById('rua').value = "";
                }
            }
        });

        // 3. Lógica "Sem Número"
        if(chkSemNumero) {
            chkSemNumero.addEventListener('change', (e) => {
                if(e.target.checked) {
                    numInput.value = "SN";
                    numInput.readOnly = true;
                    numInput.classList.remove('input-error');
                    numInput.style.backgroundColor = "#e0e0e0";
                } else {
                    numInput.value = "";
                    numInput.readOnly = false;
                    numInput.style.backgroundColor = "#C3C3C3";
                }
            });
        }

        /* ==================================================================
           QUESTÃO 1: VALIDAÇÕES & QUESTÃO 3: INTEGRAÇÃO BACKEND
           ================================================================== */

        btnLimpar.addEventListener('click', () => {
            if(confirm("Tem certeza que deseja limpar todos os campos?")) {
                form.reset();
                document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));
                if(numInput.readOnly) {
                    numInput.readOnly = false;
                    numInput.style.backgroundColor = "#C3C3C3";
                }
            }
        });

        // Evento de Enviar modificado para Questão 3
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const dados = Object.fromEntries(formData);
            let erros = [];

            const marcarErro = (id) => {
                const el = document.getElementById(id);
                if(el) el.classList.add('input-error');
            };
            document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));

            // --- Validação Frontend (Questão 1) ---
            if (!dados.nome || dados.nome.trim().length < 3 || dados.nome.length > 50) {
                erros.push("Nome: Entre 3 e 50 caracteres.");
                marcarErro('nome');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailRegex.test(dados.email)) {
                erros.push("E-mail: Formato inválido.");
                marcarErro('email');
            }
            if (!dados.rua || dados.rua.trim().length < 4) {
                erros.push("Rua: Mínimo de 4 caracteres.");
                marcarErro('rua');
            }
            if (!dados.numero || dados.numero.trim() === "") {
                erros.push("Número: Obrigatório.");
                marcarErro('numero');
            }
            const cepLimpo = dados.cep.replace(/\D/g, '');
            if (cepLimpo.length !== 8) {
                erros.push("CEP: Formato inválido.");
                marcarErro('cep');
            }
            if (!dados.cidade || dados.cidade.trim().length < 3) {
                erros.push("Cidade: Mínimo de 3 caracteres.");
                marcarErro('cidade');
            }
            if (!dados.estado || dados.estado.trim().length !== 2) {
                erros.push("Estado: Use a sigla (ex: CE).");
                marcarErro('estado');
            }
            
            const senha = dados.senha;
            const validacaoSenha = 
                senha.length >= 10 &&
                /[a-zA-Z]/.test(senha) &&     
                /[0-9]/.test(senha) &&        
                /[*;#]/.test(senha) &&        
                !/[^a-zA-Z0-9*;#]/.test(senha); 

            if (!validacaoSenha) {
                erros.push("Senha: Min 10 chars, letras, núm e especiais (* ; #).");
                marcarErro('senha');
            }
            if (dados.senha !== dados.senha_confirm) {
                erros.push("Confirmação: Senhas não conferem.");
                marcarErro('senha-confirm');
            }

            // --- Decisão: Se Frontend OK -> Enviar p/ Backend (Questão 3) ---
            if (erros.length > 0) {
                alert("Erros no formulário (Frontend):\n\n- " + erros.join("\n- "));
            } else {
                
                // Exibe feedback de "Enviando..."
                const btnSubmit = document.getElementById('btnEnviar');
                const textoOriginal = btnSubmit.innerHTML;
                btnSubmit.innerText = "Enviando...";
                btnSubmit.disabled = true;

                try {
                    // Envia para o Backend na porta 5000
                    const response = await fetch('http://localhost:5000/cadastrarusr', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(dados)
                    });

                    const result = await response.json();

                    if (response.status === 200) {
                        // Sucesso: 200 OK
                        exibirJSONNaTela(dados);
                    } else {
                        // Erro: 500 (SQL Injection ou Validação Backend)
                        let msgErro = "Erro no Servidor:\n";
                        if (result.detalhes) {
                            msgErro += "- " + result.detalhes.join("\n- ");
                        } else if (result.erro) {
                            msgErro += result.erro;
                        }
                        alert(msgErro);
                    }

                } catch (error) {
                    console.error("Erro na requisição:", error);
                    alert("Erro ao conectar com o servidor (Verifique se o backend está rodando).");
                } finally {
                    // Restaura botão
                    btnSubmit.innerHTML = textoOriginal;
                    btnSubmit.disabled = false;
                }
            }
        });
    }

    function exibirJSONNaTela(dados) {
        delete dados.senha_confirm; 
        document.body.innerHTML = ''; 
        
        document.body.style.backgroundColor = '#0d0d0d';
        document.body.style.color = '#4AAD4A';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.minHeight = '100vh';
        document.body.style.fontFamily = "'Courier New', monospace";

        const title = document.createElement('h1');
        title.innerText = "> CADASTRO REALIZADO (SERVER 200 OK)_";

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
});document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA LISTAGEM DE USUÁRIOS (Existente) ---
    const usersGrid = document.querySelector('.users-grid');
    if (usersGrid) {
        fetch('/listar_usurios').catch(() => []); 
    }

    // --- LÓGICA DO FORMULÁRIO (Questões 1, 2 e 3) ---
    const form = document.getElementById('cadastroForm');
    const cepInput = document.getElementById('cep');
    const btnLimpar = document.getElementById('btnLimpar');
    const chkSemNumero = document.getElementById('sem-numero');
    const numInput = document.getElementById('numero');

    if (form) {
        
        /* ==================================================================
           QUESTÃO 2: INTEGRAÇÃO API DE CEP E PREENCHIMENTO AUTOMÁTICO
           ================================================================== */
        
        // 1. Máscara do CEP (00000-000)
        cepInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, ''); 
            if (val.length > 8) val = val.slice(0, 8);
            if (val.length > 5) {
                val = val.substring(0, 5) + '-' + val.substring(5);
            }
            e.target.value = val;
        });

        // 2. Busca na API ViaCEP
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                try {
                    document.getElementById('rua').value = "Buscando endereço...";
                    document.getElementById('cidade').value = "...";
                    
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    
                    if (!data.erro) {
                        document.getElementById('rua').value = data.logradouro;
                        document.getElementById('bairro').value = data.bairro;
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('estado').value = data.uf;
                        
                        ['rua', 'bairro', 'cidade', 'estado'].forEach(id => {
                            document.getElementById(id).classList.remove('input-error');
                        });
                        numInput.focus();
                    } else {
                        alert("CEP não encontrado!");
                        document.getElementById('rua').value = "";
                        document.getElementById('cidade').value = "";
                    }
                } catch (e) {
                    console.error("Erro ViaCEP", e);
                    alert("Erro ao consultar CEP.");
                    document.getElementById('rua').value = "";
                }
            }
        });

        // 3. Lógica "Sem Número"
        if(chkSemNumero) {
            chkSemNumero.addEventListener('change', (e) => {
                if(e.target.checked) {
                    numInput.value = "SN";
                    numInput.readOnly = true;
                    numInput.classList.remove('input-error');
                    numInput.style.backgroundColor = "#e0e0e0";
                } else {
                    numInput.value = "";
                    numInput.readOnly = false;
                    numInput.style.backgroundColor = "#C3C3C3";
                }
            });
        }

        /* ==================================================================
           QUESTÃO 1: VALIDAÇÕES & QUESTÃO 3: INTEGRAÇÃO BACKEND
           ================================================================== */

        btnLimpar.addEventListener('click', () => {
            if(confirm("Tem certeza que deseja limpar todos os campos?")) {
                form.reset();
                document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));
                if(numInput.readOnly) {
                    numInput.readOnly = false;
                    numInput.style.backgroundColor = "#C3C3C3";
                }
            }
        });

        // Evento de Enviar modificado para Questão 3
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const dados = Object.fromEntries(formData);
            let erros = [];

            const marcarErro = (id) => {
                const el = document.getElementById(id);
                if(el) el.classList.add('input-error');
            };
            document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));

            // --- Validação Frontend (Questão 1) ---
            if (!dados.nome || dados.nome.trim().length < 3 || dados.nome.length > 50) {
                erros.push("Nome: Entre 3 e 50 caracteres.");
                marcarErro('nome');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailRegex.test(dados.email)) {
                erros.push("E-mail: Formato inválido.");
                marcarErro('email');
            }
            if (!dados.rua || dados.rua.trim().length < 4) {
                erros.push("Rua: Mínimo de 4 caracteres.");
                marcarErro('rua');
            }
            if (!dados.numero || dados.numero.trim() === "") {
                erros.push("Número: Obrigatório.");
                marcarErro('numero');
            }
            const cepLimpo = dados.cep.replace(/\D/g, '');
            if (cepLimpo.length !== 8) {
                erros.push("CEP: Formato inválido.");
                marcarErro('cep');
            }
            if (!dados.cidade || dados.cidade.trim().length < 3) {
                erros.push("Cidade: Mínimo de 3 caracteres.");
                marcarErro('cidade');
            }
            if (!dados.estado || dados.estado.trim().length !== 2) {
                erros.push("Estado: Use a sigla (ex: CE).");
                marcarErro('estado');
            }
            
            const senha = dados.senha;
            const validacaoSenha = 
                senha.length >= 10 &&
                /[a-zA-Z]/.test(senha) &&     
                /[0-9]/.test(senha) &&        
                /[*;#]/.test(senha) &&        
                !/[^a-zA-Z0-9*;#]/.test(senha); 

            if (!validacaoSenha) {
                erros.push("Senha: Min 10 chars, letras, núm e especiais (* ; #).");
                marcarErro('senha');
            }
            if (dados.senha !== dados.senha_confirm) {
                erros.push("Confirmação: Senhas não conferem.");
                marcarErro('senha-confirm');
            }

            // --- Decisão: Se Frontend OK -> Enviar p/ Backend (Questão 3) ---
            if (erros.length > 0) {
                alert("Erros no formulário (Frontend):\n\n- " + erros.join("\n- "));
            } else {
                
                // Exibe feedback de "Enviando..."
                const btnSubmit = document.getElementById('btnEnviar');
                const textoOriginal = btnSubmit.innerHTML;
                btnSubmit.innerText = "Enviando...";
                btnSubmit.disabled = true;

                try {
                    // Envia para o Backend na porta 5000
                    const response = await fetch('http://localhost:5000/cadastrarusr', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(dados)
                    });

                    const result = await response.json();

                    if (response.status === 200) {
                        // Sucesso: 200 OK
                        exibirJSONNaTela(dados);
                    } else {
                        // Erro: 500 (SQL Injection ou Validação Backend)
                        let msgErro = "Erro no Servidor:\n";
                        if (result.detalhes) {
                            msgErro += "- " + result.detalhes.join("\n- ");
                        } else if (result.erro) {
                            msgErro += result.erro;
                        }
                        alert(msgErro);
                    }

                } catch (error) {
                    console.error("Erro na requisição:", error);
                    alert("Erro ao conectar com o servidor (Verifique se o backend está rodando).");
                } finally {
                    // Restaura botão
                    btnSubmit.innerHTML = textoOriginal;
                    btnSubmit.disabled = false;
                }
            }
        });
    }

    function exibirJSONNaTela(dados) {
        delete dados.senha_confirm; 
        document.body.innerHTML = ''; 
        
        document.body.style.backgroundColor = '#0d0d0d';
        document.body.style.color = '#4AAD4A';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.minHeight = '100vh';
        document.body.style.fontFamily = "'Courier New', monospace";

        const title = document.createElement('h1');
        title.innerText = "> CADASTRO REALIZADO (SERVER 200 OK)_";

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
});document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA LISTAGEM DE USUÁRIOS (Existente) ---
    const usersGrid = document.querySelector('.users-grid');
    if (usersGrid) {
        fetch('/listar_usurios').catch(() => []); 
    }

    // --- LÓGICA DO FORMULÁRIO (Questões 1, 2 e 3) ---
    const form = document.getElementById('cadastroForm');
    const cepInput = document.getElementById('cep');
    const btnLimpar = document.getElementById('btnLimpar');
    const chkSemNumero = document.getElementById('sem-numero');
    const numInput = document.getElementById('numero');

    if (form) {
        
        /* ==================================================================
           QUESTÃO 2: INTEGRAÇÃO API DE CEP E PREENCHIMENTO AUTOMÁTICO
           ================================================================== */
        
        // 1. Máscara do CEP (00000-000)
        cepInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, ''); 
            if (val.length > 8) val = val.slice(0, 8);
            if (val.length > 5) {
                val = val.substring(0, 5) + '-' + val.substring(5);
            }
            e.target.value = val;
        });

        // 2. Busca na API ViaCEP
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                try {
                    document.getElementById('rua').value = "Buscando endereço...";
                    document.getElementById('cidade').value = "...";
                    
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    
                    if (!data.erro) {
                        document.getElementById('rua').value = data.logradouro;
                        document.getElementById('bairro').value = data.bairro;
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('estado').value = data.uf;
                        
                        ['rua', 'bairro', 'cidade', 'estado'].forEach(id => {
                            document.getElementById(id).classList.remove('input-error');
                        });
                        numInput.focus();
                    } else {
                        alert("CEP não encontrado!");
                        document.getElementById('rua').value = "";
                        document.getElementById('cidade').value = "";
                    }
                } catch (e) {
                    console.error("Erro ViaCEP", e);
                    alert("Erro ao consultar CEP.");
                    document.getElementById('rua').value = "";
                }
            }
        });

        // 3. Lógica "Sem Número"
        if(chkSemNumero) {
            chkSemNumero.addEventListener('change', (e) => {
                if(e.target.checked) {
                    numInput.value = "SN";
                    numInput.readOnly = true;
                    numInput.classList.remove('input-error');
                    numInput.style.backgroundColor = "#e0e0e0";
                } else {
                    numInput.value = "";
                    numInput.readOnly = false;
                    numInput.style.backgroundColor = "#C3C3C3";
                }
            });
        }

        /* ==================================================================
           QUESTÃO 1: VALIDAÇÕES & QUESTÃO 3: INTEGRAÇÃO BACKEND
           ================================================================== */

        btnLimpar.addEventListener('click', () => {
            if(confirm("Tem certeza que deseja limpar todos os campos?")) {
                form.reset();
                document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));
                if(numInput.readOnly) {
                    numInput.readOnly = false;
                    numInput.style.backgroundColor = "#C3C3C3";
                }
            }
        });

        // Evento de Enviar modificado para Questão 3
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const dados = Object.fromEntries(formData);
            let erros = [];

            const marcarErro = (id) => {
                const el = document.getElementById(id);
                if(el) el.classList.add('input-error');
            };
            document.querySelectorAll('.styled-input').forEach(el => el.classList.remove('input-error'));

            // --- Validação Frontend (Questão 1) ---
            if (!dados.nome || dados.nome.trim().length < 3 || dados.nome.length > 50) {
                erros.push("Nome: Entre 3 e 50 caracteres.");
                marcarErro('nome');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailRegex.test(dados.email)) {
                erros.push("E-mail: Formato inválido.");
                marcarErro('email');
            }
            if (!dados.rua || dados.rua.trim().length < 4) {
                erros.push("Rua: Mínimo de 4 caracteres.");
                marcarErro('rua');
            }
            if (!dados.numero || dados.numero.trim() === "") {
                erros.push("Número: Obrigatório.");
                marcarErro('numero');
            }
            const cepLimpo = dados.cep.replace(/\D/g, '');
            if (cepLimpo.length !== 8) {
                erros.push("CEP: Formato inválido.");
                marcarErro('cep');
            }
            if (!dados.cidade || dados.cidade.trim().length < 3) {
                erros.push("Cidade: Mínimo de 3 caracteres.");
                marcarErro('cidade');
            }
            if (!dados.estado || dados.estado.trim().length !== 2) {
                erros.push("Estado: Use a sigla (ex: CE).");
                marcarErro('estado');
            }
            
            const senha = dados.senha;
            const validacaoSenha = 
                senha.length >= 10 &&
                /[a-zA-Z]/.test(senha) &&     
                /[0-9]/.test(senha) &&        
                /[*;#]/.test(senha) &&        
                !/[^a-zA-Z0-9*;#]/.test(senha); 

            if (!validacaoSenha) {
                erros.push("Senha: Min 10 chars, letras, núm e especiais (* ; #).");
                marcarErro('senha');
            }
            if (dados.senha !== dados.senha_confirm) {
                erros.push("Confirmação: Senhas não conferem.");
                marcarErro('senha-confirm');
            }

            // --- Decisão: Se Frontend OK -> Enviar p/ Backend (Questão 3) ---
            if (erros.length > 0) {
                alert("Erros no formulário (Frontend):\n\n- " + erros.join("\n- "));
            } else {
                
                // Exibe feedback de "Enviando..."
                const btnSubmit = document.getElementById('btnEnviar');
                const textoOriginal = btnSubmit.innerHTML;
                btnSubmit.innerText = "Enviando...";
                btnSubmit.disabled = true;

                try {
                    // Envia para o Backend na porta 5000
                    const response = await fetch('http://localhost:5000/cadastrarusr', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(dados)
                    });

                    const result = await response.json();

                    if (response.status === 200) {
                        // Sucesso: 200 OK
                        exibirJSONNaTela(dados);
                    } else {
                        // Erro: 500 (SQL Injection ou Validação Backend)
                        let msgErro = "Erro no Servidor:\n";
                        if (result.detalhes) {
                            msgErro += "- " + result.detalhes.join("\n- ");
                        } else if (result.erro) {
                            msgErro += result.erro;
                        }
                        alert(msgErro);
                    }

                } catch (error) {
                    console.error("Erro na requisição:", error);
                    alert("Erro ao conectar com o servidor (Verifique se o backend está rodando).");
                } finally {
                    // Restaura botão
                    btnSubmit.innerHTML = textoOriginal;
                    btnSubmit.disabled = false;
                }
            }
        });
    }

    function exibirJSONNaTela(dados) {
        delete dados.senha_confirm; 
        document.body.innerHTML = ''; 
        
        document.body.style.backgroundColor = '#0d0d0d';
        document.body.style.color = '#4AAD4A';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.minHeight = '100vh';
        document.body.style.fontFamily = "'Courier New', monospace";

        const title = document.createElement('h1');
        title.innerText = "> CADASTRO REALIZADO (SERVER 200 OK)_";

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