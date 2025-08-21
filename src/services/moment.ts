


import moment from 'moment-timezone';


export const configMoment = ()=>{
    
    const now = moment.tz("America/Sao_Paulo");
   
    function formatarDataHora(data: string) {
        // Tenta analisar a data no fuso horário de São Paulo
        let aux = moment.tz(data, "America/Sao_Paulo");
        // Verifica se a data foi válida
        if (!aux.isValid()) {
          //  console.log("Data inválida");
        }
        // Formata a data e hora no formato desejado
        return aux.format("YYYY-MM-DD HH:mm:ss");
    }

    function dataHoraAtual(){
        let data = now.format("YYYY-MM-DD HH:mm:ss"); // Usa HH para 24 horas
        return data;
    }

    function generatorDate(){
        let data = now.format("YYYYMMDDHHmmss"); // Usa HH para 24 horas
        return data;
    }

    function dataAtual(){
        const formattedDate = now.format("YYYY-MM-DD"); // Usa HH para 24 horas
         return formattedDate;
    }

    function formatarData( data:string ){
        let aux = moment.tz(data, "America/Sao_Paulo").format("YYYY-MM-DD");
        return aux;
    }

      function primeiroDiaMes() {
        // Obtém a data atual e calcula o início do mês a cada chamada
        const data = moment.tz("America/Sao_Paulo").startOf('month').format("YYYY-MM-DD");
        return data;
    }

    return { primeiroDiaMes,dataAtual, generatorDate, dataHoraAtual, formatarData, formatarDataHora }
}