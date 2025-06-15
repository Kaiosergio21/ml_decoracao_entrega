function toggleSenha() {
    const senhaInput = document.getElementById("senha");
    const tipoAtual = senhaInput.getAttribute("type");
    senhaInput.setAttribute("type", tipoAtual === "password" ? "text" : "password");
}


  async function fazerLogin(event) {
    event.preventDefault();

    const email = document.querySelector('input[name="email"]').value;
    const senha = document.querySelector('input[name="senha"]').value;

    const resposta = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      // Redireciona para a Home se login der certo
      window.location.href = '/';
    } else {
      alert(resultado.mensagem);
    }
  }
