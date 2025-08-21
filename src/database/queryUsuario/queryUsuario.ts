import { useSQLiteContext } from "expo-sqlite"

export const useUsuario = ()=>{

type Usuario = {
    codigo:number,
    nome:string,
    senha:string,
    email:string
    token:string,
    lembrar:string
}

const db = useSQLiteContext();


async function selectAll(){
    try{
        let result = await db.getAllAsync(`SELECT * FROM usuarios `);
        console.log(result);
        return result;
    }catch( e){
        console.log(`erro ao buscar usuarios `, e);
    } 
}


async function selectByCode( code:number ):Promise<Usuario[] | undefined>{
    try{
        let result:Usuario[] = await db.getAllAsync(`SELECT * FROM usuarios where codigo = ${ code } `);
        console.log(result);
        return result;
    }catch( e){
        console.log(`erro ao buscar usuario codigo ${code} `, e);
    } 
}


async function selectByName( name:string ){
    try{
        let result = await db.getAllAsync(`SELECT * FROM usuarios where nome = '${ name }' `);
        console.log(result);
        return result;
    }catch( e){
        console.log(`erro ao buscar usuario pelo nome ${name} `, e);
    } 
}

async function selectRemember(): Promise<Usuario[] | undefined>{
    let result:Usuario[] | [];
    try{
        result = await db.getAllAsync(`SELECT * FROM usuarios where lembrar = 'S' `);
        if( result.length < 0 || isNaN(result.length)){
        }
        return result;

    }catch( e){
        console.log(`erro ao buscar usuario lembrar = S `, e);
    } 
}
 
async function create ( user:Usuario ){
    console.log(user)
    let  { codigo , nome, senha , email, token, lembrar } = user;
   let verifyUser: any
   
   if( codigo){
    verifyUser  = await selectByCode( codigo );
    }else{
        console.log(`codigo ${codigo } invalido`)
    }
         
    if(verifyUser.length > 0 ){
    console.log('Usuario', nome,' ja foi cadastrado!');    
        }else{
        
            let verifyName:any = await selectByName(nome);

                    if( verifyName?.length > 0  ){
                        if(verifyUser.nome === user.nome){
                            console.log(` ${nome} ja esta sendo utilizado pelo usuario codigo: ${verifyUser.codigo}  `)    
                            return;
                        } 
                    }else{
                        try{
                            let result = await db.runAsync(
                                ` INSERT INTO usuarios
                                    ( codigo, nome, senha , email, lembrar, token  ) VALUES 
                            ( ${codigo}, '${nome}', '${senha}', '${email}', '${lembrar}', '${token}' ); `);
                           // console.log('Usuario cadastrado: ',result.lastInsertRowId);
                            return result.lastInsertRowId
    
                    }catch(e){
                        console.log('Erro ao criar o usuario: ', codigo,' nome: ', nome ,' ', e)
                    }
                   }

        }
}


async function insert ( user:Usuario ){
    let  { codigo , nome, senha , email ,token , lembrar} = user;

    try{
        let result = await db.runAsync(
            ` INSERT INTO usuarios
                ( codigo, nome, senha , email , lembrar, token ) VALUES 
        ( ${codigo}, '${nome}', '${senha}', '${email}',  '${lembrar}', '${token}' ); `);

      return result.lastInsertRowId
}catch(e){
    console.log('Erro ao criar o usuario: ', codigo,' nome: ', nome ,' ', e)
}
}


async function createUser ( user:Usuario ){

    let verifyRemember:any = await selectRemember()
        if(verifyRemember?.length > 0 || verifyRemember !== undefined){
            await updateRemember()
        }

    let  { codigo , nome, senha , email ,token , lembrar} = user;
    let verifyUser: any = await selectByCode( codigo );
          
     if(verifyUser.length > 0 || verifyUser !== undefined ){
        await deleteUser(codigo)
            try{
                let result = await db.runAsync(
                    ` INSERT INTO usuarios
                        ( codigo, nome, senha , email , lembrar, token ) VALUES 
                ( ${codigo}, '${nome}', '${senha}', '${email}',  '${lembrar}', '${token}' ); `);

              return result.lastInsertRowId
        }catch(e){
            console.log('Erro ao criar o usuario: ', codigo,' nome: ', nome ,' ', e)
        }

            }else{
         
                         try{
                             let result = await db.runAsync(
                                 ` INSERT INTO usuarios
                                     ( codigo, nome, senha , email, lembrar, token ) VALUES 
                             ( ${codigo}, '${nome}', '${senha}', '${email}','${lembrar}', '${token}' ); `);
                             console.log('Usuario cadastrado: ',result.lastInsertRowId);
                             return result.lastInsertRowId
                                
                     }catch(e){
                         console.log('Erro ao criar o usuario: ', codigo,' nome: ', nome ,' ', e)
                     }
         }
 }



async function update ( user:Usuario ){
    let  { codigo , nome, senha , email,  lembrar, token } = user;
    
    let verifyUser: any = await selectByCode( codigo );
    
    if(verifyUser.length > 0 ){
       // console.log('Usuario', nome,' ja foi cadastrado!');    
    try{
 
             let result = await db.runAsync(
                 ` UPDATE usuarios SET 
                         
             codigo =  ${codigo},  nome = '${nome}', senha = '${senha}' email = '${email}'  lembrar='${lembrar}' token ='${token}'  where codigo = ${codigo} `);
              console.log(`Usuario codigo:${codigo} atualizado ! ` );

              return result.lastInsertRowId
 
     }catch(e){
         console.log('Erro ao atualizar o usuario: ', codigo,' nome: ', nome ,' ', e)
     }
 }
 }
 async function updateRemember (   ){
    try{
             let result = await db.runAsync(
                 ` UPDATE usuarios SET lembrar ='N'
                `);

              return result.lastInsertRowId
 
     }catch(e){
         console.log('Erro ao atualizar os usuarios:  ', e)
     }
 }
 
 async function signin ( user:Usuario ){
    let { nome , senha  } = user; 
    try{
        let result = await db.getAllAsync(`SELECT * FROM usuarios where nome = '${ nome }' and senha = '${senha}' `);
      //  console.log(result);
        return result;
    }catch( e){
        console.log(`erro ao buscar usuarios `, e);
    } 
 }
 
 
 async function deleteUser(code:number){
    try{
        let result = await db.execAsync(`DELETE FROM usuarios where codigo = ${code}`)
        console.log(`log exclusao usuario ${code}`)
    }catch( e ) { console.log(e) }
}

async function deleteAll(){
    try{
        let result = await db.execAsync(`DELETE FROM usuarios `)
        console.log(`log exclusao usuarios `, result)
    }catch( e ) { console.log(e) }
}




return  { insert,deleteAll, updateRemember,signin ,selectRemember ,createUser, selectAll, create, update, selectByCode, selectByName  } 

}