import { categoria, useCategoria } from "../database/queryCategorias/queryCategorias";
import { useFotosProdutos } from "../database/queryFotosProdutos/queryFotosProdutos";
import { marca, useMarcas } from "../database/queryMarcas/queryMarcas";
import { produto, useProducts } from "../database/queryProdutos/queryProdutos";
 
import { configMoment } from "./moment";


 export  const insertDataFic = () => {

  const useQueryProdutos = useProducts();
   
  const useMoment = configMoment();
  const useQueryCategoria = useCategoria() 
  const useQueryMarcas = useMarcas();
  const useQueryFotos = useFotosProdutos();

  let products:produto[] = 
  [
    {
        codigo: 1,
        estoque:5,
        preco:10.5,
        grupo: 1,
        origem:"00" ,
        descricao:"Produto-teste-1",
        ativo: "S",
        sku: "PRD0001",
        marca:1,
        class_fiscal:"0000.00.00",
        cst:"00",
        num_fabricante:"132565",
        observacoes1:"",
        observacoes2:"",
        observacoes3:"",
        data_cadastro: useMoment.dataAtual(),
        data_recadastro:useMoment.dataHoraAtual(),
        tipo:'1'
    },
       {
        codigo: 2,
        estoque:6,
        preco:20.1,
        grupo: 1,
        origem:"00" ,
        descricao:"Produto-teste-2",
        ativo: "S",
        sku: "PRD0002",
        marca:1,
        class_fiscal:"0000.00.00",
        cst:"00",
        num_fabricante:"69344",
        observacoes1:"",
        observacoes2:"",
        observacoes3:"",
        data_cadastro: useMoment.dataAtual(),
        data_recadastro:useMoment.dataHoraAtual(),
        tipo:'1'

    }
  ]
 
 
 

let categorias:categoria[] = [
    {
        codigo:1,
        data_cadastro:useMoment.dataAtual(),
        data_recadastro: useMoment.dataHoraAtual(),
        descricao:"Categoria-teste-1"
    },
    {
        codigo:2,
        data_cadastro:useMoment.dataAtual(),
        data_recadastro: useMoment.dataHoraAtual(),
        descricao:"Categoria-teste-2"
    },
    

]

let marcas:marca[] = [
        {
        codigo:1,
        data_cadastro:useMoment.dataAtual(),
        data_recadastro: useMoment.dataHoraAtual(),
        descricao:"Marca-teste-1"
    },
    {
        codigo:2,
        data_cadastro:useMoment.dataAtual(),
        data_recadastro: useMoment.dataHoraAtual(),
        descricao:"Marca-teste-2"
    },
    
]
let fotos=[
     {
		 produto : 1,
		 sequencia : 1,
		 descricao : "ft",
		 link : "https://i.ibb.co/H7grssp/RYZEN-5.png",
		 foto : "Wm5Rdw==",
		  data_cadastro:useMoment.dataAtual(),
        data_recadastro: useMoment.dataHoraAtual(),
	},
    {
		 produto : 2,
		 sequencia : 1,
		 descricao : "ft",
		 link : "https://i.ibb.co/Brqvtvj/Screenshot-6.png",
		 foto : "SUE9PQ==",
        data_cadastro:useMoment.dataAtual(),
        data_recadastro: useMoment.dataHoraAtual(),
	},
]

    async function main() {
            for( const p of products  ){
                    await useQueryProdutos.create(p)
            }
          //for( const v of veiculos){
          //  await useQueryVeiculos.create(v)
          //}

          for(const c of categorias ){
            await useQueryCategoria.create(c)
          }
          for( const m of marcas ){
            await useQueryMarcas.create(m)
          }
            for( const f of fotos ){
                await useQueryFotos.create(f)
            }
        }


    return {main }
}