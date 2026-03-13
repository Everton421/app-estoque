type pedido ={ 
    codigo?:number,
     id: number,
     id_externo: number,
     
    situacao:string,
    descontos:number,
    vendedor:number,
    forma_pagamento:number,
    enviado:string,
    observacoes:string,
    quantidade_parcelas:number,
    total_geral:number,
    total_produtos:number,
    total_servicos:number,
    cliente:cliente ,
    produtos?:produto_pedido[],
    servicos?: servico_pedido[],
    parcelas:parcela[], 
    data_cadastro:string,
    data_recadastro:string,
    veiculo:number,
    tipo_os:number,
    tipo:number,
    contato:string
}

 type cliente = {
    codigo:number, 
    nome:string,
    endereco:string,
    celular:string ,
    numero:string
 }

   type produto_pedido = {
        codigo:number,
        desconto:number,
        descricao:string,
        quantidade:number,
        preco:number,
        total:number 
    }
     type parcela = {
      pedido:number,
      parcela:number,
      valor:number,
      vencimento:string
    } 
     type servico_pedido = {
      codigo:number,
      desconto:number,
      aplicacao:string,
      quantidade:number,
      valor:number,
      total:number 
  }

export function generateOrderHTML(pedido: pedido): string {

  const produtosHTML = pedido.produtos
    ? pedido.produtos.map(
        (produto) => `
        <tr>
          <td class="border p-1 text-left">${produto.codigo}</td>
          <td class="border p-1 text-left">Produto ${produto.descricao}</td>  
          <td class="border p-1 text-right">${produto.quantidade}</td>
          <td class="border p-1 text-right">${produto.preco.toFixed(2)}</td>
          <td class="border p-1 text-right">${produto.total.toFixed(2)}</td>
        </tr>
      `
      ).join('')
    : '<tr><td colspan="5" class="border p-1 text-center">Nenhum produto adicionado</td></tr>';

  const servicosHTML = pedido.servicos
    ? pedido.servicos.map(
        (servico) => `
        <tr>
          <td class="border p-1 text-left">${servico.codigo}</td>
          <td class="border p-1 text-left">Serviço ${servico.aplicacao}</td>
          <td class="border p-1 text-right">${servico.quantidade}</td>
          <td class="border p-1 text-right">${servico.valor.toFixed(2)}</td>
          <td class="border p-1 text-right">${servico.total.toFixed(2)}</td>
        </tr>
      `
      ).join('')
    : '<tr><td colspan="5" class="border p-1 text-center">Nenhum serviço adicionado</td></tr>';

  const parcelasHTML = pedido.parcelas
    ? pedido.parcelas.map(
        (parcela) => `
        <tr>
          <td class="border p-1 text-left">${parcela.parcela}</td>
          <td class="border p-1 text-right">${parcela.valor.toFixed(2)}</td>
          <td class="border p-1 text-right">${parcela.vencimento}</td>
        </tr>
      `
      ).join('')
    : '<tr><td colspan="3" class="border p-1 text-center">Nenhuma parcela cadastrada</td></tr>';


  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Detalhes do Pedido</title>
      <style>
        /* Estilos básicos para o layout do PDF */
        body {
          font-family: sans-serif;
          font-size: 12px;
        }
        .container {
          border: 1px solid #ddd;
          padding: 16px;
          border-radius: 4px;
        }
        .flex {
          display: flex;
        }
        .justify-between {
          justify-content: space-between;
        }
        .text-base {
          font-size: 12px; /* Equivalente a text-base */
        }
        .font-bold {
          font-weight: bold;
        }
        .mb-4 {
          margin-bottom: 16px;
        }
        .text-center {
          text-align: center;
        }
        .grid {
          display: grid;
        }
        .grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .gap-x-4 {
          column-gap: 16px;
        }
        .my-4 {
          margin-top: 16px;
          margin-bottom: 16px;
        }
        hr {
          border: 0;
          border-top: 1px solid #ddd;
        }
        .text-xl {
          font-size: 1.5rem; /* Equivalente a text-xl */
        }
        .font-semibold {
          font-weight: 600;
        }
        .w-full {
          width: 100%;
        }
        .text-sm {
          font-size: 0.875rem; /* Equivalente a text-sm */
        }
        .border-collapse {
          border-collapse: collapse;
        }
        .border {
          border: 1px solid #ddd;
        }
        .bg-gray-100 {
          background-color: #f7f7f7;
        }
        .p-1 {
          padding: 4px;
        }
        .text-left {
          text-align: left;
        }
        .text-right {
          text-align: right;
        }
        .text-lg {
          font-size: 1.125rem; /* Equivalente a text-lg */
        }
        .whitespace-pre-wrap {
            white-space: pre-wrap;
        }

      </style>
    </head>
    <body>

    <div class="container">
      <div class="flex justify-between">
        <h1 class="text-base font-bold mb-4 text-center">Pedido #${pedido.id}</h1>
        <h1 class="text-base font-bold mb-4 text-center">Código externo #${pedido.id_externo}</h1>
      </div>

      <div class="grid grid-cols-2 gap-x-4 mb-4">
        <div><strong>Cliente:</strong> <span data-cliente-nome>${pedido.cliente.nome}</span></div>
        <div><strong>Data:</strong> <span data-data-cadastro>${pedido.data_cadastro}</span></div>
        <div><strong>Endereco:</strong> <span data-cliente-endereco>${pedido.cliente.endereco}</span></div> 
        <div><strong>Numero:</strong> <span data-cliente-numero>${pedido.cliente.numero}</span></div>
        <div><strong>Celular:</strong> <span data-cliente-celular>${pedido.cliente.celular}</span></div>
      </div>

      <hr class="my-4">

      <h2 class="text-xl font-semibold mb-2">Produtos</h2>
      <table class="w-full text-sm border-collapse border">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-1 text-left">Cód.</th>
            <th class="border p-1 text-left">Descrição</th>
            <th class="border p-1 text-right">Qtd.</th>
            <th class="border p-1 text-right">Vlr. Unit.</th>
            <th class="border p-1 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${produtosHTML}
        </tbody>
      </table>

      <hr class="my-4">

      <div id="servicos-container">
        <h2 class="text-xl font-semibold mb-2">Serviços</h2>
        <table class="w-full text-sm border-collapse border">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-1 text-left">Cód.</th>
              <th class="border p-1 text-left">Descrição</th>
              <th class="border p-1 text-right">Qtd.</th>
              <th class="border p-1 text-right">Vlr. Unit.</th>
              <th class="border p-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${servicosHTML}
          </tbody>
        </table>
        <hr class="my-4">
      </div>

      <div id="parcelas-container">
         <h2 class="text-xl font-semibold mb-2">Parcelas</h2>
        <table class="w-full text-sm border-collapse border">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-1 text-left">Parcela</th>
              <th class="border p-1 text-right">Valor</th>
              <th class="border p-1 text-right">Vencimento</th>
            </tr>
          </thead>
          <tbody>
            ${parcelasHTML}
          </tbody>
        </table>
         <hr class="my-4">
      </div>


      <div class="mb-4">
        <h3 class="font-semibold">Observações:</h3>
        <p class="text-sm whitespace-pre-wrap" data-observacoes>${pedido.observacoes}</p>
      </div>

      <div class="text-right font-bold text-lg">
        Total Geral: R$ <span data-total-geral>${pedido.total_geral.toFixed(2)}</span>
      </div>

    </div>
    </body>
    </html>
  `;
}