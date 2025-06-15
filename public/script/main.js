const openShopping = document.querySelector(".shopping"),
      closeShopping = document.querySelector(".closeShopping"),
      body = document.querySelector("body"),
      list = document.querySelector(".list"),
      listCard = document.querySelector(".listCard"),
      total = document.querySelector(".total"),
      quantity = document.querySelector(".quantity");

// Event listeners para abrir/fechar carrinho
openShopping.addEventListener("click", () => {
    body.classList.add("active");
});

closeShopping.addEventListener("click", () => {
    body.classList.remove("active");
});

// Lista de produtos (preços em centavos para evitar problemas com decimais)
let products = [
    {
        "id": 1,
        "name": "Festa Princesas",
        "image": "festa_princesa.webp",
        "price": 20000, // R$ 200,00
        "description": "Decoração mágica com castelo e princesas."
    },
    {
        "id": 2,
        "name": "Festa Boteco",
        "image": "festa_boteco.webp",
        "price": 25000, // R$ 250,00
        "description": "Decoração descontraída com tema de boteco."
    },
    {
        "id": 3,
        "name": "Casamento Clássico",
        "image": "casamento_classico.webp",
        "price": 50000, // R$ 500,00
        "description": "Decoração elegante com flores brancas e dourado."
    }
];

let listCards = [];

// Inicializa a lista de produtos
const initApp = () => {
    products.forEach((value, key) => {
        let newDiv = document.createElement("div");
        newDiv.classList.add("item");
        newDiv.innerHTML = `
            <img src="../imagens_div/produtos/${value.image}">
            <div class="title">${value.name}</div>
            <div class="description">${value.description}</div>
            <div class="price">R$ ${(value.price/100).toFixed(2).replace('.', ',')}</div>
            <button onclick="addToCard(${key})">Adicionar ao Carrinho</button>
        `;
        list.appendChild(newDiv);
    });
}

initApp();

// Adiciona produto ao carrinho
const addToCard = key => {
    if(listCards[key] == null) {
        listCards[key] = JSON.parse(JSON.stringify(products[key]));
        listCards[key].quantity = 1;
    } else {
        listCards[key].quantity++;
        listCards[key].price = listCards[key].quantity * products[key].price;
    }
    reloadCard();
}

// Atualiza a exibição do carrinho
const reloadCard = () => {
    listCard.innerHTML = "";
    let count = 0;
    let totalPrice = 0;

    listCards.forEach((value, key) => {
        if(value != null) {
            totalPrice += value.price;
            count += value.quantity;

            let newDiv = document.createElement("li");
            newDiv.innerHTML = `
                <div><img src="../imagens_div/produtos/${value.image}"></div>
                <div>
                    <div class="cardTitle">${value.name}</div>
                    <div class="cardPrice">R$ ${(value.price/100).toFixed(2).replace('.', ',')}</div>
                </div>
                <div>
                    <button class="cardButton" onclick="changeQuantity(${key}, ${value.quantity - 1})">-</button>
                    <div class="count">${value.quantity}</div>
                    <button class="cardButton" onclick="changeQuantity(${key}, ${value.quantity + 1})">+</button>
                </div>
            `;
            listCard.appendChild(newDiv);
        }
    });

    total.innerText = `R$ ${(totalPrice/100).toFixed(2).replace('.', ',')}`;
    quantity.innerText = count;
}

// Altera quantidade de um item no carrinho
const changeQuantity = (key, quantity) => {
    if(quantity == 0) {
        delete listCards[key];
    } else {
        listCards[key].quantity = quantity;
        listCards[key].price = quantity * products[key].price;
    }
    reloadCard();
}

// Função para reservar todos os itens do carrinho
async function reservarCarrinho() {
    const resposta = await fetch('/verificar-login', {
        credentials: 'include'
    });
    const resultado = await resposta.json();

    if (!resultado.logado) {
        alert('Você precisa estar logado para reservar!');
        window.location.href = '/login';
        return false;
    }

    try {
        for (const [key, item] of listCards.entries()) {
            if (item) {
                const res = await fetch('/carrinho', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        usuarioId: resultado.usuarioId,
                        produtoId: item.id,
                        quantidade: item.quantity
                    })
                });

                if (!res.ok) {
                    const dados = await res.json();
                    alert(dados.mensagem || 'Erro ao adicionar produto ao carrinho');
                    return false;
                }
            }
        }
        return true;
    } catch (erro) {
        console.error(erro);
        alert('Erro ao reservar produtos');
        return false;
    }
}

// Função para reservar um produto individual
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

// Envia pedido por WhatsApp
total.addEventListener("click", async () => {
    if (listCards.length === 0 || listCards.filter(item => item).length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    
    // Primeiro reserva no sistema
    const reservaOk = await reservarCarrinho();
    if (!reservaOk) return;

    // Depois envia por WhatsApp
    let message = "🛒 *Pedido de Decoração de Festas*%0A%0A";
    listCards.forEach((item) => {
        if (item) {
            message += `*${item.name}* - Quantidade: ${item.quantity} - Total: R$ ${(item.price/100).toFixed(2).replace('.', ',')}%0A`;
        }
    });

    let totalPrice = listCards.reduce((sum, item) => item ? sum + item.price : sum, 0);
    message += `%0A*Valor total:* R$ ${(totalPrice/100).toFixed(2).replace('.', ',')}`;
    message += `%0A%0A*Informações do cliente:*%0ANome: %0ATelefone: %0AEndereço:`;

    let phoneNumber = "5571991818322"; // Substitua pelo seu número
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
});