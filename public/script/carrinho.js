const menu = document.getElementById("dropdown-menu");
const botaoMenu = document.getElementById("button-all");


botaoMenu.addEventListener("click", () => {
    menu.classList.toggle("ativo");
    menu.classList.toggle("menucult");
});



//favoritos
const btnFavorito = document.getElementById('btn-favorito');
  const produtoId = document.getElementById('produto-id').value; // ou outro jeito de pegar o id
  // exemplo, pegue dinamicamente do login

  btnFavorito.addEventListener('click', async () => {
    try {
      const response = await fetch('/favoritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoId, usuarioId }),
      });
      const data = await response.json();

      if (data.sucesso) {
        if (data.favorito) {
          btnFavorito.classList.add('favorito');
          btnFavorito.textContent = '♥'; // cheio e vermelho
        } else {
          btnFavorito.classList.remove('favorito');
          btnFavorito.textContent = '♡'; // vazio e cinza
        }
      } else {
        alert('Erro ao favoritar: ' + data.mensagem);
      }
    } catch (err) {
      console.error(err);
      alert('Erro na comunicação com o servidor.');
    }
  });

async function reservarProduto(produtoId, quantidade = 1) {
  const resposta = await fetch('/verificar-login', {
    credentials: 'include'
  });
  const resultado = await resposta.json();

  if (!resultado.logado) {
    alert('Você precisa estar logado para reservar!');
    window.location.href = '/login';
    return;
  }

  try {
    const res = await fetch('/carrinho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        usuarioId: resultado.usuarioId,
        produtoId: produtoId,
        quantidade: quantidade
      })
    });

    const dados = await res.json();

    if (!res.ok) {
      alert(dados.mensagem || 'Erro ao adicionar produto ao carrinho');
      return;
    }

    alert('Produto reservado com sucesso!');
    window.location.href = '/carrinho';

  } catch (erro) {
    console.error(erro);
    alert('Erro ao reservar produto');
  }
}


 // ajuste para seu backend

     const usuarioId = sessionStorage.getItem('usuarioId') || 1; // ou use outra lógica
    const API_BASE = 'http://localhost:6006';
async function carregarCarrinho(usuarioId) {
  try {
    const res = await fetch(`${API_BASE}/carrinho/${usuarioId}`);
    const itens = await res.json();

    const lista = document.getElementById('lista-carrinho');
    lista.innerHTML = ''; // limpa o conteúdo antes de adicionar

    if (itens.length === 0) {
      lista.innerHTML = '<p>Carrinho vazio.</p>';
      document.getElementById('quantidade-total').textContent = 'Quantidade (0)';
      document.getElementById('preco-total').textContent = 'Total: R$0,00';
      return;
    }

    let totalGeral = 0;
    let totalQtd = 0;

    itens.forEach(item => {
      totalQtd += item.quantidade_carrinho;
      totalGeral += item.preco_total_carrinho;

      // Cria um elemento div para o item
      const div = document.createElement('div');
      div.classList.add('cart-item');

      // Monta o conteúdo do item
      div.innerHTML = `
  <p>Nome: ${item.nome}</p>
  <p>Preço unitário: R$${(item.preco_total_carrinho / item.quantidade_carrinho).toFixed(2)}</p>
  <p>Quantidade: ${item.quantidade_carrinho}</p>
  <p>Total: R$${item.preco_total_carrinho.toFixed(2)}</p>
  <button onclick="removerItem(${item.id_carrinho})">Remover</button>
`;
      lista.appendChild(div);
    });

    document.getElementById('quantidade-total').textContent = `Quantidade (${totalQtd})`;
    document.getElementById('preco-total').textContent = `Total: R$${totalGeral.toFixed(2)}`;

  } catch (err) {
    console.error('Erro ao carregar carrinho', err);
    alert('Erro ao carregar carrinho');
  }
}
 // Exemplo fixo, pegue isso conforme seu sistema de login
carregarCarrinho(usuarioId);



    async function removerItem(idCarrinho) {
      if (!confirm('Deseja remover este item?')) return;

      try {
        const res = await fetch(`${API_BASE}/carrinho/${idCarrinho}`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.mensagem);
        carregarCarrinho();
      } catch (err) {
        console.error('Erro ao remover item', err);
        alert('Erro ao remover item');
      }
    }

