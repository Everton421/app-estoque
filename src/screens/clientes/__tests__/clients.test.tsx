 
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Clientes } from '..';   
import { cliente,   } from '../../../database/queryClientes/queryCliente';
import { RenderItensClients } from '../components/renderItemsClients/RenderItensClients';


const mockNavigation = { 
  navigate: jest.fn(),
  goBack: jest.fn(),
  addlistener: jest.fn((event, callback)=>{
    if(event === 'focus'){
      callback();
    }
    return ()=>{}
  })
}

  const objMockClient: cliente =
   {
    codigo:1,
    celular:'44 999317550',
    cep:'86990000',
    cidade:'maringa',
    cnpj:'00000000000',
    endereco:'Rua teste.',
    estado:'PR',
    bairro: 'Conj teste.',
    ie:'16.395.238-3',
    nome:'Client test',
    numero:'1',
    data_cadastro:'2025-08-25',
    data_recadastro:'2025-08-25 00:00:00',
    vendedor: 2,
    
  }

 
jest.mock('../../../database/queryClientes/queryCliente', ()=> ({
   useClients: jest.fn(()=>({
    selectAllLimit: jest.fn().mockResolvedValue( [ objMockClient ] ),
    selectByDescription: jest.fn().mockResolvedValue([ objMockClient ])
   }))
}) )

 

//  test('testing screen RenderItensClients',async () => {
      // const {   getByText  } =   render(<RenderItensClients  item={objMockClient} handleSelect={()=>{}} />);
//
      // let validText =  getByText('Client test') 
      //   expect(validText ).toBeVisible()

//  });

test('testing screen clients', async () => {
  let findByText;

  await act(async () => {
     findByText   = render(<Clientes navigation={mockNavigation} />) ;
     console.log(findByText)
  });

  // Espere que o componente carregue os dados e renderize o texto
  //const element = await findByText('Client test');
  //expect(element).toBeVisible();
});