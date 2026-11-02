// Busca os elementos que vamos usar na página
const formulario = document.querySelector("#formulario-gasto");
const listaGastos = document.querySelector("#lista-gastos");
const seletorMes = document.querySelector("#mes");
const filtroCategoria = document.querySelector("#filtro");
const campoData = document.querySelector("#data");

// Nomes que aparecem para cada categoria
const nomesCategorias = {
  alimentacao: "Alimentação",
  moradia: "Moradia",
  transporte: "Transporte",
  lazer: "Lazer",
  saude: "Saúde",
  educacao: "Educação",
  compras: "Compras",
  outros: "Outros"
};

// Recupera os dados salvos no navegador. Se ainda não houver, começa com uma lista vazia.
let gastos = JSON.parse(localStorage.getItem("meuSaldoGastos")) || [];
let orcamento = Number(localStorage.getItem("meuSaldoOrcamento")) || 0;

// Define a data de hoje e o mês atual como valores iniciais
const hoje = new Date();
const dataHoje = hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0") + "-" + String(hoje.getDate()).padStart(2, "0");
const mesAtual = dataHoje.slice(0, 7);
campoData.value = dataHoje;
seletorMes.value = mesAtual;

function formatarDinheiro(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function salvarDados() {
  localStorage.setItem("meuSaldoGastos", JSON.stringify(gastos));
  localStorage.setItem("meuSaldoOrcamento", orcamento);
}

function atualizarPagina() {
  const mesEscolhido = seletorMes.value;
  const categoriaEscolhida = filtroCategoria.value;

  // Mostra somente os gastos do mês e da categoria selecionados
  const gastosVisiveis = gastos.filter(function (gasto) {
    const mesmoMes = gasto.data.slice(0, 7) === mesEscolhido;
    const mesmaCategoria = categoriaEscolhida === "todas" || gasto.categoria === categoriaEscolhida;
    return mesmoMes && mesmaCategoria;
  });

  // Os cartões sempre somam todos os gastos do mês, mesmo quando há um filtro de categoria
  const gastosDoMes = gastos.filter(function (gasto) {
    return gasto.data.slice(0, 7) === mesEscolhido;
  });
  const total = gastosDoMes.reduce(function (soma, gasto) {
    return soma + Number(gasto.valor);
  }, 0);

  document.querySelector("#total-gastos").textContent = formatarDinheiro(total);
  document.querySelector("#orcamento-mensal").textContent = formatarDinheiro(orcamento);
  document.querySelector("#saldo-disponivel").textContent = formatarDinheiro(orcamento - total);

  // Limpa a tabela antes de desenhar os gastos atualizados
  listaGastos.innerHTML = "";

  if (gastosVisiveis.length === 0) {
    const linhaVazia = document.createElement("tr");
    linhaVazia.className = "estado-vazio";
    linhaVazia.innerHTML = '<td colspan="5">Nenhum gasto encontrado neste mês.</td>';
    listaGastos.appendChild(linhaVazia);
    return;
  }

  // Ordena para mostrar primeiro os gastos mais recentes
  gastosVisiveis.sort(function (a, b) {
    return b.data.localeCompare(a.data);
  });

  gastosVisiveis.forEach(function (gasto) {
    const linha = document.createElement("tr");
    const dataFormatada = new Date(gasto.data + "T12:00:00").toLocaleDateString("pt-BR");

    linha.innerHTML = `
      <td>${escaparTexto(gasto.descricao)}</td>
      <td>${nomesCategorias[gasto.categoria]}</td>
      <td>${dataFormatada}</td>
      <td class="alinhar-direita">${formatarDinheiro(gasto.valor)}</td>
      <td class="acoes">
        <button class="botao-acao editar" type="button" data-id="${gasto.id}">Editar</button>
        <button class="botao-acao excluir" type="button" data-id="${gasto.id}">Excluir</button>
      </td>
    `;
    listaGastos.appendChild(linha);
  });
}

// Evita que uma descrição digitada vire código HTML
function escaparTexto(texto) {
  const elemento = document.createElement("span");
  elemento.textContent = texto;
  return elemento.innerHTML;
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const gasto = {
    id: Date.now(),
    descricao: document.querySelector("#descricao").value.trim(),
    valor: Number(document.querySelector("#valor").value),
    categoria: document.querySelector("#categoria").value,
    data: campoData.value
  };

  gastos.push(gasto);
  salvarDados();
  atualizarPagina();
  formulario.reset();
  campoData.value = dataHoje;
  document.querySelector("#descricao").focus();
});

// Editar ou excluir o gasto clicado
listaGastos.addEventListener("click", function (evento) {
  const botao = evento.target;
  const id = Number(botao.dataset.id);

  if (botao.classList.contains("excluir")) {
    gastos = gastos.filter(function (gasto) {
      return gasto.id !== id;
    });
    salvarDados();
    atualizarPagina();
  }

  if (botao.classList.contains("editar")) {
    const gasto = gastos.find(function (item) {
      return item.id === id;
    });

    const novaDescricao = prompt("Digite a descrição:", gasto.descricao);
    if (novaDescricao === null || novaDescricao.trim() === "") return;

    const novoValor = prompt("Digite o valor (use ponto para centavos):", gasto.valor);
    if (novoValor === null || Number(novoValor) <= 0) return;

    gasto.descricao = novaDescricao.trim();
    gasto.valor = Number(novoValor);
    salvarDados();
    atualizarPagina();
  }
});

// Permite mudar o orçamento mensal
document.querySelector("#botao-orcamento").addEventListener("click", function () {
  const novoOrcamento = prompt("Qual é o seu orçamento mensal? (use ponto para centavos)", orcamento || "");
  if (novoOrcamento === null || novoOrcamento.trim() === "") return;
  if (Number(novoOrcamento) < 0 || Number.isNaN(Number(novoOrcamento))) {
    alert("Digite um valor válido.");
    return;
  }

  orcamento = Number(novoOrcamento);
  salvarDados();
  atualizarPagina();
});

seletorMes.addEventListener("change", atualizarPagina);
filtroCategoria.addEventListener("change", atualizarPagina);

// Desenha os dados ao abrir a página
atualizarPagina();

