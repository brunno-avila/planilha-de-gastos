const formulario = document.querySelector("#formulario-gasto");
const listaGastos = document.querySelector("#lista-gastos");
const seletorMes = document.querySelector("#mes");
const filtro = document.querySelector("#filtro");

const categorias = {
  alimentacao: "Alimentação",
  moradia: "Moradia",
  transporte: "Transporte",
  lazer: "Lazer",
  saude: "Saúde",
  educacao: "Educação",
  compras: "Compras",
  outros: "Outros"
};

let gastos = JSON.parse(localStorage.getItem("gastos")) || [];
let orcamento = Number(localStorage.getItem("orcamento")) || 0;

const hoje = new Date();
const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");
const dataHoje = `${ano}-${mes}-${dia}`;

document.querySelector("#data").value = dataHoje;
seletorMes.value = `${ano}-${mes}`;

function salvarDados() {
  localStorage.setItem("gastos", JSON.stringify(gastos));
  localStorage.setItem("orcamento", orcamento);
}

function atualizarPagina() {
  const mesEscolhido = seletorMes.value;
  const categoriaEscolhida = filtro.value;

  const gastosDoMes = gastos.filter(function (gasto) {
    return gasto.data.slice(0, 7) === mesEscolhido;
  });

  let total = 0;

  gastosDoMes.forEach(function (gasto) {
    total += Number(gasto.valor);
  });

  document.querySelector("#total-gastos").textContent =
    total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  document.querySelector("#orcamento-mensal").textContent =
    orcamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  document.querySelector("#saldo-disponivel").textContent =
    (orcamento - total).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  const gastosVisiveis = gastosDoMes.filter(function (gasto) {
    return categoriaEscolhida === "todas" ||
      gasto.categoria === categoriaEscolhida;
  });

  listaGastos.innerHTML = "";

  if (gastosVisiveis.length === 0) {
    listaGastos.innerHTML =
      '<tr><td colspan="5">Nenhum gasto encontrado.</td></tr>';
    return;
  }

  gastosVisiveis.forEach(function (gasto) {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${gasto.descricao}</td>
      <td>${categorias[gasto.categoria]}</td>
      <td>${gasto.data}</td>
      <td class="alinhar-direita">R$ ${Number(gasto.valor).toFixed(2)}</td>
      <td>
        <button type="button" data-id="${gasto.id}" class="editar">Editar</button>
        <button type="button" data-id="${gasto.id}" class="excluir">Excluir</button>
      </td>
    `;

    listaGastos.appendChild(linha);
  });
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const gasto = {
    id: Date.now(),
    descricao: document.querySelector("#descricao").value,
    valor: Number(document.querySelector("#valor").value),
    categoria: document.querySelector("#categoria").value,
    data: document.querySelector("#data").value
  };

  gastos.push(gasto);
  salvarDados();
  atualizarPagina();

  formulario.reset();
  document.querySelector("#data").value = dataHoje;
});

listaGastos.addEventListener("click", function (evento) {
  const id = Number(evento.target.dataset.id);

  if (evento.target.classList.contains("excluir")) {
    gastos = gastos.filter(function (gasto) {
      return gasto.id !== id;
    });
  }

  if (evento.target.classList.contains("editar")) {
    const gasto = gastos.find(function (item) {
      return item.id === id;
    });

    const descricaoNova = prompt("Nova descrição:", gasto.descricao);
    if (descricaoNova === null || descricaoNova.trim() === "") return;

    const valorNovo = Number(prompt("Novo valor:", gasto.valor));
    if (Number.isNaN(valorNovo) || valorNovo <= 0) return;

    gasto.descricao = descricaoNova;
    gasto.valor = valorNovo;
  }

  salvarDados();
  atualizarPagina();
});

document.querySelector("#botao-orcamento").addEventListener("click", function () {
  const entrada = prompt("Digite seu orçamento mensal:");

  if (entrada === null || entrada.trim() === "") return;

  const valor = Number(entrada);

  if (Number.isNaN(valor) || valor < 0) {
    alert("Digite um valor válido.");
    return;
  }

  orcamento = valor;
  salvarDados();
  atualizarPagina();
});

seletorMes.addEventListener("change", atualizarPagina);
filtro.addEventListener("change", atualizarPagina);

atualizarPagina();