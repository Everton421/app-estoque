import { createContext, useState } from "react";

const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda se o mês for menor que 10
    const day = String(now.getDate()).padStart(2, '0'); // Adiciona zero à esquerda se o dia for menor que 10

    return `${year}-${month}-${day}`;
  };
  
  let data_atual = getCurrentDate();

       export  interface OrcamentoModel  {
            "produtos": [],
            "cliente":{},
            "parcelas":[],
            "servicos":[],
            "data_cadastro":string,
            "data_recadastro":string,
            total_produtos: number,
            total_servicos:  number,
            contato: `react-native `,
            total_geral: number,
            descontos: number,

        }
export const OrcamentoContext = createContext({
  orcamento: {
    produtos: [],
    cliente: {},
    parcelas: [],
    data_cadastro: "",
    data_recadastro: "",

  },
  setOrcamento: (orcamento: OrcamentoModel) => {}
});
    function OrcamentoProvider({ children }:any){
            const [ orcamento , setOrcamento]  = useState  ( {
                "produtos": [],
                "cliente":{},
                "parcelas":[],
                "servicos":[],
                "data_cadastro": "",
                "data_recadastro": ""
              } );

            return (
                <OrcamentoContext.Provider value={ {  orcamento, setOrcamento}}>
                    {children}
                </OrcamentoContext.Provider>
            )
    }
export default OrcamentoProvider;