import { render } from "@testing-library/react-native"
import { Alterar_senha } from ".."


describe("AlterarSenha",()=>{
    test('<AlterarSenha/>',()=>{
        const { getByText } = render(<Alterar_senha  />)
    
        let button = getByText('Alterar Senha')
    })
})