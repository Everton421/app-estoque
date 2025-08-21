export const formatItem = () => {


      function formatDateTime(dateTime) {
        const date = new Date(dateTime); // Converte a string em objeto Date
        const year = date.getFullYear(); // Obtém o ano
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Obtém o mês (0-11) e formata para 2 dígitos
        const day = String(date.getDate()).padStart(2, '0'); // Obtém o dia e formata para 2 dígitos
        
        const hours = String(date.getHours()).padStart(2, '0'); // Obtém as horas e formata para 2 dígitos
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Obtém os minutos e formata para 2 dígitos
        const seconds = String(date.getSeconds()).padStart(2,'0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Retorna no formato YYYY-MM-DD HH:mm
    }

    function formatDate(dateTime) {
      const date = new Date(dateTime); // Converte a string em objeto Date
      const year = date.getFullYear(); // Obtém o ano
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Obtém o mês (0-11) e formata para 2 dígitos
      const day = String(date.getDate()).padStart(2, '0'); // Obtém o dia e formata para 2 dígitos
      
     // const hours = String(date.getHours()).padStart(2, '0'); // Obtém as horas e formata para 2 dígitos
     // const minutes = String(date.getMinutes()).padStart(2, '0'); // Obtém os minutos e formata para 2 dígitos
     // const seconds = String(date.getSeconds()).padStart(2,'0');
      return `${year}-${month}-${day}`; // Retorna no formato YYYY-MM-DD HH:mm
  }


    function normalizeString(str) {
      if (!str) return str; // Retorna undefined ou null sem alteração
      return str
          .normalize("NFD") // Normaliza para remover acentos
          .replace(/[\u0300-\u036f]/g, "") // Remove acentos
          .replace(/['"]/g, ""); // Remove aspas simples e duplas
  }



    return  { formatDateTime, normalizeString ,formatDate } 
}