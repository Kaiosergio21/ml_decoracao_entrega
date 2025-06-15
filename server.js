const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 6006;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).promise();


// ===================
// 🏁 INICIAR SERVIDOR
// ===================
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/imagens_div', express.static(path.join(__dirname, 'public/imagens_div')));

app.use(session({
  secret: 'segredo_super_secreto', // troque por um segredo seguro
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000 // 1 hora, por exemplo
  }
}));
// ===================
// 🔗 ROTA PRINCIPAL
// ===================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'produtos_novo.html'));
});


//cadastro 
app.get('/verificar-login', (req, res) => {
  if (req.session.usuario) {
    return res.json({ logado: true, usuarioId: req.session.usuario.id });
  }
  res.json({ logado: false });
});


app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos' });
  }

  try {
    // Verifica se e-mail já existe
    const [usuarios] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (usuarios.length > 0) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado' });
    }

    // Criptografa senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await db.query(
      'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaCriptografada]
    );

    res.json({ mensagem: 'Cadastro realizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro no cadastro' });
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha e-mail e senha' });
  }

  try {
    const [usuarios] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos' });
    }

    const usuario = usuarios[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos' });
    }

    req.session.usuario = { id: usuario.id_usuario, nome: usuario.nome };
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro no login' });
  }
});

app.post('/troca-de-senha', async (req, res) => {
  const { cpf_cnpj, senha_nova } = req.body;

  if (!cpf_cnpj || !senha_nova) {
    return res.status(400).send('Preencha todos os campos.');
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha_nova, 10);

    const [resultado] = await db.query(
      'UPDATE usuario SET senha = ? WHERE cpf_cnpj = ?',
      [senhaCriptografada, cpf_cnpj]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).send('CPF/CNPJ não encontrado.');
    }

    // Redirecionar ou exibir mensagem de sucesso
    res.send('Senha atualizada com sucesso!');
  } catch (erro) {
    console.error(erro);
    res.status(500).send('Erro ao atualizar senha.');
  }
});


function checarAutenticacao(req, res, next) {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.status(401).json({ mensagem: 'Não autenticado' });
  }
}

app.post('/reservar', checarAutenticacao, (req, res) => {
  // Exemplo: req.session.usuario.id
  res.json({ sucesso: true, mensagem: 'Reserva efetuada!' });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ mensagem: 'Logout realizado com sucesso' });
  });
});

//carrinho



// 1. Adicionar item ao carrinho
app.post('/carrinho', async (req, res) => {
 const usuarioId = req.session.usuario?.id;
  const { produtoId, quantidade } = req.body;

  
  if (!usuarioId || !produtoId || !quantidade) {
    console.log('Dados inválidos no carrinho:', { usuarioId, produtoId, quantidade });
    return res.status(400).json({ mensagem: 'Usuário, produto e quantidade são obrigatórios' });
  }

  try {
    // Verificar se item já está no carrinho ativo
    const [rows] = await db.query(
      `SELECT * FROM carrinho WHERE fk_usuario_id_usuario = ? AND fk_produto_id_produto = ? AND status_carrinho = 1`,
      [usuarioId, produtoId]
    );

    if (rows.length > 0) {
      // Atualiza quantidade e preço total do item existente
      const novoQuantidade = rows[0].quantidade_carrinho + quantidade;
      const precoPorUnidade = rows[0].preco_total_carrinho / rows[0].quantidade_carrinho;
      const novoPrecoTotal = precoPorUnidade * novoQuantidade;

      await db.query(
        `UPDATE carrinho SET quantidade_carrinho = ?, preco_total_carrinho = ? WHERE id_carrinho = ?`,
        [novoQuantidade, novoPrecoTotal, rows[0].id_carrinho]
      );

      return res.json({ mensagem: 'Quantidade do item atualizada no carrinho' });
    }

    // Para calcular preco_total_carrinho, buscar preco do produto
    const [produtos] = await db.query(
      'SELECT preco FROM produto WHERE id_produto = ?',
      [produtoId]
    );
    if (produtos.length === 0) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }
    const precoProduto = produtos[0].preco;
    const precoTotal = precoProduto * quantidade;

    // Inserir novo item no carrinho
    await db.query(
      `INSERT INTO carrinho 
        (quantidade_carrinho, preco_total_carrinho, data_e_hora_criacao_carrinho, status_carrinho, fk_usuario_id_usuario, fk_produto_id_produto)
       VALUES (?, ?, NOW(), 1, ?, ?)`,
      [quantidade, precoTotal, usuarioId, produtoId]
    );

    res.json({ mensagem: 'Item adicionado ao carrinho com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao adicionar item ao carrinho' });
  }
});


// 2. Listar itens do carrinho de um usuário
app.get('/carrinho/:usuarioId', async (req, res) => {
  const usuarioId = req.params.usuarioId;

  try {
    const [rows] = await db.query(
      `SELECT c.id_carrinho, c.quantidade_carrinho, c.preco_total_carrinho, p.nome, p.preco
       FROM carrinho c
       JOIN produto p ON c.fk_produto_id_produto = p.id_produto
       WHERE c.fk_usuario_id_usuario = ? AND c.status_carrinho = 1`,
      [usuarioId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar itens do carrinho' });
  }
});


// 3. Atualizar quantidade de um item no carrinho
app.put('/carrinho/:idCarrinho', async (req, res) => {
  const idCarrinho = req.params.idCarrinho;
  const { quantidade } = req.body;

  if (!quantidade || quantidade < 1) {
    return res.status(400).json({ mensagem: 'Quantidade inválida' });
  }

  try {
    // Buscar o item para pegar preço unitário
    const [rows] = await db.query(
      `SELECT quantidade_carrinho, preco_total_carrinho FROM carrinho WHERE id_carrinho = ? AND status_carrinho = 1`,
      [idCarrinho]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Item não encontrado no carrinho' });
    }

    const precoPorUnidade = rows[0].preco_total_carrinho / rows[0].quantidade_carrinho;
    const novoPrecoTotal = precoPorUnidade * quantidade;

    await db.query(
      `UPDATE carrinho SET quantidade_carrinho = ?, preco_total_carrinho = ? WHERE id_carrinho = ?`,
      [quantidade, novoPrecoTotal, idCarrinho]
    );

    res.json({ mensagem: 'Quantidade atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar quantidade' });
  }
});


// 4. Remover item do carrinho (atualiza status para 0)
app.delete('/carrinho/:idCarrinho', async (req, res) => {
  const idCarrinho = req.params.idCarrinho;

  try {
    await db.query(
      `UPDATE carrinho SET status_carrinho = 0 WHERE id_carrinho = ?`,
      [idCarrinho]
    );
    res.json({ mensagem: 'Item removido do carrinho' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao remover item do carrinho' });
  }
});


// 5. Limpar carrinho (opcional)
app.delete('/carrinho/limpar/:usuarioId', async (req, res) => {
  const usuarioId = req.params.usuarioId;

  try {
    await db.query(
      `UPDATE carrinho SET status_carrinho = 0 WHERE fk_usuario_id_usuario = ?`,
      [usuarioId]
    );
    res.json({ mensagem: 'Carrinho limpo com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao limpar carrinho' });
  }
});


// ===================
// 🔗 VIEWS
// ===================
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'cadastro.html'));
});
app.get('/troca_senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'troca_senha.html'));
});

app.get('/carrinho', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','views', 'carrinho.html'));
});


// ===================
// 🔑 TROCA DE SENHA
// ===================

// ===================
// 🛒 CARRINHO
// ===================
// Get items from cart


// ===================
// 📦 PRODUTOS
// ===================

app.get('/produtos/categoria/:categoria', async (req, res) => {
  const categoria = req.params.categoria;
  let sql = 'SELECT * FROM produto';
  const values = [];

  if (categoria !== 'todos') {
    sql += ' WHERE categoria = ?';
    values.push(categoria);
  }

  try {
    const [results] = await db.query(sql, values);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos por categoria' });
  }
});

// ===================
// 🌟 AVALIAÇÕES
// ===================
app.post('/avaliacoes', async (req, res) => {
  const { estrelas, comentario, produtoId, usuarioId } = req.body;
  if (!estrelas || !comentario || !produtoId || !usuarioId) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }
  try {
    await db.query(
      `INSERT INTO avaliacao (estrelas, comentario, fk_produto_id_produto, fk_usuario_id_usuario, data_avaliacao)
       VALUES (?, ?, ?, ?, NOW())`,
      [estrelas, comentario, produtoId, usuarioId]
    );
    res.json({ message: 'Avaliação salva com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar avaliação.' });
  }
});

app.get('/avaliacoes/:produtoId', async (req, res) => {
  const produtoId = req.params.produtoId;
  try {
    const [results] = await db.query(
      `SELECT estrelas, comentario 
       FROM avaliacao 
       WHERE fk_produto_id_produto = ? 
       ORDER BY data_avaliacao DESC`,
      [produtoId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});

// ===================
// ❤️ FAVORITOS
// ===================
app.post('/favoritos', async (req, res) => {
  const { produtoId, usuarioId } = req.body;
  if (!produtoId || !usuarioId) {
    return res.json({ sucesso: false, mensagem: 'Dados incompletos' });
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM favoritado WHERE fk_produto_id_produto = ? AND fk_usuario_id_usuario = ?',
      [produtoId, usuarioId]
    );
    if (rows.length > 0) {
      await db.query(
        'DELETE FROM favoritado WHERE fk_produto_id_produto = ? AND fk_usuario_id_usuario = ?',
        [produtoId, usuarioId]
      );
      return res.json({ sucesso: true, favorito: false });
    } else {
      await db.query(
        'INSERT INTO favoritado (fk_produto_id_produto, fk_usuario_id_usuario) VALUES (?, ?)',
        [produtoId, usuarioId]
      );
      return res.json({ sucesso: true, favorito: true });
    }
  } catch (error) {
    return res.json({ sucesso: false, mensagem: 'Erro no banco de dados' });
  }
});
