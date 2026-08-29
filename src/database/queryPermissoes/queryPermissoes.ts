import { useSQLiteContext } from "expo-sqlite"

export type Permissao = {
    codigo: number;
    id: string;
    descricao: string;
}

export const usePermissoes = () => {

    const db = useSQLiteContext();

    async function deleteAll() {
        try {
            let result = await db.runAsync(`DELETE FROM permissoes;`);
            return result.changes;
        } catch (e) {
            console.log('Erro ao limpar as permissões: ', e);
        }
    }

    async function insertMany(permissoes: Permissao[], usuario: number) {
        try {
            for (const permissao of permissoes) {
                await db.runAsync(
                    ` INSERT INTO permissoes
                        ( codigo, id, descricao, usuario ) VALUES
                    ( ${permissao.codigo}, '${permissao.id}', '${permissao.descricao}', ${usuario} ); `
                );
            }
        } catch (e) {
            console.log('Erro ao salvar as permissões: ', e);
        }
    }

    async function selectAll(): Promise<Permissao[] | undefined> {
        try {
            let result = await db.getAllAsync(`SELECT * FROM permissoes;`);
            return result as Permissao[];
        } catch (e) {
            console.log('Erro ao buscar permissões: ', e);
        }
    }

    async function selectByUsuario(usuario: number): Promise<Permissao[] | undefined> {
        try {
            let result = await db.getAllAsync(`SELECT * FROM permissoes where usuario = ${usuario};`);
            return result as Permissao[];
        } catch (e) {
            console.log(`Erro ao buscar permissões do usuario ${usuario}: `, e);
        }
    }

    async function hasPermission(id: string, usuario: number): Promise<boolean> {
        try {
            let result: any = await db.getAllAsync(
                `SELECT * FROM permissoes where usuario = ${usuario} and id = '${id}' LIMIT 1;`
            );
            return result?.length > 0;
        } catch (e) {
            console.log(`Erro ao verificar permissão ${id}: `, e);
            return false;
        }
    }

    return { deleteAll, insertMany, selectAll, selectByUsuario, hasPermission };
}
