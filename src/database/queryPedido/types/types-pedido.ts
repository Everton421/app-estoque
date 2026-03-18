   export type pedidoApi ={ 
    codigo?:number,
     id: number,
     id_externo: string,
     id_interno: string,
     codigo_site?:any
    situacao:string,
    situacao_separacao: 'N' | 'P' | 'I'
    descontos:number,
    vendedor:number,
    forma_pagamento:number,
    enviado:string,
    observacoes:string,
    quantidade_parcelas:number,
    total_geral:number,
    total_produtos:number,
    total_servicos:number,
    cliente: { codigo:number} ,
    produtos:produto_pedido[],
    parcelas:parcela[], 
    servicos: servico_pedido[],
    data_cadastro:string,
    data_recadastro:string,
    veiculo:number,
    tipo_os:number,
    tipo:number,
    contato:string
    frete:number

}

 export type produto_pedido = {
        codigo:number,
        sequencia:number
        desconto:number,
        quantidade:number,
        preco:number,
        total:number,
        quantidade_separada:number
        quantidade_faturada:number
        frete:number
    }
   export type parcela = {
      pedido:number,
      parcela:number,
      valor:number,
      vencimento:string
    } 
  export  type servico_pedido = {
      codigo:number,
      desconto:number,
      quantidade:number,
      valor:number,
      total:number 
  }

  


 export type pedido ={ 
    codigo?:number,
     id: number,
     id_externo: number,
    situacao:string,
    situacao_separacao: 'N' | 'P' | 'I'
    descontos:number,
    vendedor:number,
    forma_pagamento:number,
    frete:number
    enviado:string,
    observacoes:string,
    quantidade_parcelas:number,
    total_geral:number,
    total_produtos:number,
    total_servicos:number,
    cliente:number ,
    produtos:produto_pedido[],
    parcelas:parcela[], 
    data_cadastro:string,
    data_recadastro:string,
    veiculo:number,
    tipo_os:number,
    tipo:number,
    contato:string
}


 