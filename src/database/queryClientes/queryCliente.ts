import { useSQLiteContext } from "expo-sqlite";
import { formatItem } from "../../services/formatStrings";
import { construtor } from "../conexao";


   export type cliente = {
        codigo: number,
        celular: string,   
        cep: string,
        cidade:string,
        cnpj:string,
        endereco:string,   
        estado:string,
        bairro:string, 
        ie: string,
        nome: string,
        numero: string,
        data_cadastro:string,
        data_recadastro:string,
        vendedor:number
        }
export const  useClients = ()=>{


 


    const formataDados =  formatItem();
    const db = useSQLiteContext();


    function normalizeString(str:string) {
        if (!str) return str; // Retorna undefined ou null sem alteração
        return str
            .normalize("NFD") // Normaliza para remover acentos
            .replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/['"]/g, ""); // Remove aspas simples e duplas
    }
 
    async function selectByCode( code:number ):Promise<cliente[] | undefined> {
        let aux = 0;
        if(isNaN(code)){
            aux = Number(code);
        }else{
            aux = code;
        }
          try{
                const result:cliente[] = await db.getAllAsync(` SELECT *, strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro FROM clientes where codigo = ${aux}`);
                return result;
            }catch(e){ console.log(`erro ao consultar o cliente ${code} `, e)}
    }

    async function selectByCnpjAndCode(  client:cliente ) {
            try{
            const result = await db.getAllAsync(` SELECT *, strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro FROM clientes where cnpj = '${client.cnpj}' AND codigo = ${client.codigo}`);
            //console.log(result);
            return result;
        }catch( e ){console.log(`erro ao consultar o cliente ${client.codigo} `, e) }
    }

   
    async function selectAll( ) {
        try{
        const result = await db.getAllAsync(` SELECT *, strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro FROM clientes  `);
        console.log(result)
        return result;

    }catch( e ){ console.log(`erro ao consultar o clientes`,e )} 
    }

    async function selectAllLimit( limit:number ) {
        try{
        const result = await db.getAllAsync(` SELECT *, strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro FROM clientes limit ? `,  `${limit}`);
        //console.log(result)
        return result;

    }catch( e ){ console.log(`erro ao consultar o clientes`,e )} 
    }

    
    
    async function selectByDescription( query:any, limit:number):  Promise<cliente[] | undefined | []> {
        try{
              let result:cliente[] =  await db.getAllAsync(
                `   SELECT *, strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro FROM clientes WHERE nome like ? or codigo like ? limit ? `, `%${query}%`,`%${query}%`, `${limit}` )
               // console.log(result)
                return result;
            }catch(e){console.log(e)}
        }      





    async function create(client:cliente) {
        const nome = normalizeString(client.nome);
        const cidade = normalizeString(client.cidade);
        const  endereco = normalizeString(client.endereco);
        
      const data_recadastro = formataDados.formatDateTime(client.data_recadastro)

        try{
            const result = await db.runAsync( 
                ` INSERT INTO clientes (
                   codigo,
                   celular,
                   cep,
                   cidade,
                   cnpj,
                   endereco,
                   bairro,
                   estado,
                   ie,
                   nome,
                   numero,
                   data_cadastro,
                   data_recadastro,
                   vendedor
                   )
                     VALUES 
                    (
                     '${client.codigo}',
                     '${client.celular}',
                     '${client.cep}',
                     '${cidade}',
                     '${client.cnpj}',
                     '${endereco}',
                     '${client.bairro}',
                     '${client.estado}',
                     '${client.ie}',
                     '${nome}',
                     '${client.numero}',
                     '${client.data_cadastro}',
                     '${data_recadastro}',
                     '${client.vendedor}' 
                     );`
            )
//            console.log(result)
            return result

        }catch(e){ console.log(`erro ao inserir o cliente codigo:${client.codigo} `,e) }
    } 

    
    
    
    async function update( client:  Partial<cliente> , code:number) {
      const data_recadastro = formataDados.formatDateTime(client.data_recadastro)
        if( client.cidade)    client.cidade = normalizeString(client.cidade)
        if( client.nome )  client.nome = normalizeString(client.nome);
        if( client.endereco ) client.endereco = normalizeString(client.endereco);
        if( client.bairro ) client.bairro =  normalizeString(client.bairro)


        try{
            const result = await db.execAsync( 
                ` UPDATE clientes
                  SET celular = '${client.celular}',
                  cep = '${client.cep}',
                  cidade = '${client.cidade}', 
                  cnpj = '${client.cnpj}',
                  endereco ='${client.endereco}',
                  bairro = '${client.bairro}',
                  estado= '${client.estado}',
                  ie = '${client.ie}',
                  nome = '${client.nome}',
                  numero = '${client.numero}', 
                  data_cadastro ='${client.data_cadastro}',
                  data_recadastro='${data_recadastro}'

                WHERE codigo = ${code}                
                ` 
            )
            console.log('update client code: ', code);
        }catch(e){ console.log( `erro ao atualizar o cliente codigo: ${code}`,e) }
    }




////////////////////////////////////////////////////////////////////////////////////////////
    async function createByCode(client:cliente) {
            let result:any  ;
            if( client.codigo){
        result  = await selectByCnpjAndCode(client);
                
        const data_recadastro = formataDados.formatDateTime(client.data_recadastro)


                    if( result.length > 0 ){
                         
                        if( data_recadastro > result[0].data_recadastro ){

                        let aux = await update(client, client.codigo);
                    }else{
                        console.log('cliente nao atualizado');
                    }


                        return;
                    }else{

                        const nome = normalizeString(client.nome);
                        const cidade = normalizeString(client.cidade);
                        const  endereco = normalizeString(client.endereco);

                        try{
                        const result = await db.runAsync( 
                            ` INSERT INTO clientes (
                                codigo,
                                celular,
                                cep,
                                cidade,
                                cnpj,
                                endereco,
                                bairro,
                                estado,
                                ie,
                                nome,
                                numero,
                                data_cadastro,
                                data_recadastro,
                                vendedor
                                )
                                  VALUES 
                                 (
                                  '${client.codigo}',
                                  '${client.celular}',
                                  '${client.cep}',
                                  '${cidade}',
                                  '${client.cnpj}',
                                  '${endereco}',
                                  '${client.bairro}',
                                  '${client.estado}',
                                  '${client.ie}',
                                  '${nome}',
                                  '${client.numero}',
                                  '${client.data_cadastro}',
                                  '${data_recadastro}',
                                  '${client.vendedor}' 
                                  );`
                        )
                        console.log( `cliente cadastrado `,result.lastInsertRowId)
                        return result.lastInsertRowId;

                    }catch(e){ 
                        console.log(`erro ao cadastrar o cliente : ${client.codigo}  `,e) }
                     }
            }else{
                    let result:any  = await create(client)
                    console.log( `cliente cadastrado `, result.lastInsertRowId)
                        return;
            }   
    } 


    async function deleteByCode( code:number ){
        try{
            let result = await db.execAsync(`DELETE FROM clientes WHERE codigo = ${code} `)
            console.log(`clientes codigo: ${code} excluido com sucesso! `)
            console.log( result);
        }catch( e ) { console.log(e) }
    }


    async function deleteAll(){
        try{
            let result = await db.execAsync('DELETE FROM clientes')
            console.log('clientes excluidos ')
            console.log( result);
        }catch( e ) { console.log(e) }
    }

    async function restartTable(){
            try{
                await db.execAsync(
                    `DROP TABLE IF EXISTS clientes;`
                )
                await construtor(db);
            }catch(e){
                    console.log('erro ao restaurar tabela');
            }
    }


    return {selectByDescription,selectByCnpjAndCode, selectByCode, selectAll, create,createByCode,update,deleteAll, deleteByCode, restartTable ,selectAllLimit}
}
