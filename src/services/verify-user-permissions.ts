export function verifyUserPermission(module:string, action:string, userPermissions:string[]){
        if( userPermissions.some(( i:any )=> i ==  '*' ) ){
                return true;                
        }else{
                let permission = `${module}.${action}`;
                return  userPermissions.some(( i:any )=> i ==  permission ) 
        }
      }