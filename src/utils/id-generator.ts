import { usePedidos } from "../database/queryPedido/queryPedido";



export const generatorId = (code: string, codeComplement: number) => {
      
      //const aux = code.toString().length;

            let parteNumericaStr = code.split('-')[0]
                     let numero = parseInt(parteNumericaStr, 10);
                        let novoNumero = numero + 1;
            let resultadoFinal = String(novoNumero).padStart(10, '0') + '-'+codeComplement;

            return resultadoFinal
      /*
      if (aux < 10) {
            let i = 10 - aux
            let comp = '0'
            while (true) {
                  if (comp.length == i) {
                        break
                  }
                  comp += '0'
            }
           // console.log(comp + code + '-' + codeComplement);
            return comp + code + '-' + codeComplement;
      }else{
             return  code + '-' + codeComplement;
      }
      */

}