import { SQLiteRunResult, useSQLiteContext } from "expo-sqlite";

export const queryEmpresas = ()=>{

    const db = useSQLiteContext();
    interface EmpresaMobile  {
        codigo_empresa:number,
        nome:string,
        cnpj:string,
        email:string,
        responsavel:string
    }

    async function create(empresa:EmpresaMobile):Promise<SQLiteRunResult | any>{
 
        try{
            const result = await db.runAsync(
       ` INSERT INTO empresas(
                codigo,
                nome,
                cnpj,
                email,
                responsavel
                ) VALUES (
                '${empresa.codigo_empresa}',
                '${empresa.nome}'  ,
                '${empresa.cnpj}'  ,
                '${empresa.email}' ,
                '${empresa.responsavel}'
                ) `
            )
                return result
        }catch(e){
             console.log(` erro ao registrar empresa! `, e )
        }
    }

    async function selectAll() {
        try{
            let result = await db.getAllAsync(`SELECT * FROM empresas  `)
            return result;
        }catch(e){ console.log(` Erro ao consultar as empresas   ` ,e)}
    }

    async function findBycnpj(cnpj:String) {
        try{
            let result = await db.getAllAsync(`SELECT * FROM empresas where cnpj = '${cnpj}'`)
            return result;
        }catch(e){ console.log(` Erro ao consultar a empresa cnpj: ${cnpj}  ` ,e)}
    }

    async function findBycnpjAndCode(cnpj:String, code:number) {
        try{
            let result = await db.getAllAsync(`SELECT * FROM empresas where cnpj = '${cnpj}' and codigo= '${code}' `)
            return result;
        }catch(e){ console.log(` Erro ao consultar a empresa cnpj: ${cnpj}  ` ,e)}
    }





    async function createByCode(empresa:EmpresaMobile){
        if(!empresa.codigo_empresa) empresa.codigo_empresa = 1
                    let validEmpr:any = await findBycnpjAndCode(empresa.cnpj, empresa.codigo_empresa);

                     if(validEmpr.length > 0 ) {
                         let deletedEmp =    await deleteByCode(empresa.codigo_empresa); 
                         console.log("deletado ",deletedEmp)    
                     } 
                        console.log(`criando ${empresa}`)
                      
                let resultEmpresa:any = await create(empresa);
                
                return resultEmpresa.lastInsertRowId
    }

    async function deleteByCode( code:number ){
        try{
            let result = await db.execAsync(`DELETE FROM empresas WHERE codigo = ${code} `)
            console.log(` empresa ${code} excluida com sucesso! `)
            return result;
        }catch( e ) { console.log(e) }
    }




    return { findBycnpj, selectAll, create, createByCode}
}