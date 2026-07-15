// Seletores dos selects 
const rendas_gastos = document.querySelector('#valores'); //Selector de entrada das categorias 
const movimentaçao = document.querySelector('#movimentação');// selector de entradas e saidas
const btn_add = document.querySelector('#btn-adicionar');
const input =  document.getElementById("input");
const div = document.querySelector('.divs')


movimentaçao.addEventListener('change', () => {
    const valor = movimentaçao.options[movimentaçao.selectedIndex].value;
    valor_selecionado(valor);
});
// atualizar tela de entrada 

     let categorias = {};
     fetch("dados.json")
     .then(response => response.json())
     .then(data => {
         categorias = data
     })

     .catch(err => console.error("Erro ao carregar o JSON", err))

 // identificando o valor selecionado no select de tipo de entrada
   function valor_selecionado(valor){
    //Limpando o select rendas_gastos
      rendas_gastos.innerHTML = ""
      
          // const tag = valor === "saida" ? saida : entrada; antigo 

      const lista = categorias[valor] // entra ou saída
      
       lista.forEach(itens =>{
            const option = new Option(itens,itens)
            rendas_gastos.appendChild(option)
       })
     
   }
    // criando objeto vazio
   let valoresPorCategorias = {};

   // Adicionando valores ao objeto
  function addvalores(){
      const key = rendas_gastos.value
      const valorInput = Number(input.value);
      const formatter = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'})   
      //Removendo todos os cards antes de adicionar outros 
          document.querySelectorAll('.divs').forEach(itens => {
         itens.querySelectorAll('.cards').forEach(card => card.remove())
                                                                        
        })
         

        if(valorInput !== 0 && key !== "" && !isNaN(valorInput)){  
          if(!valoresPorCategorias[key]) valoresPorCategorias[key] = [];
              valoresPorCategorias[key].push(valorInput)
             for(let dia in valoresPorCategorias){
              let total =  valoresPorCategorias[dia].reduce((soma, valores)=> soma + valores,0)
                const card = document.createElement('div');
                card.className = 'cards';
                card.innerHTML = `<span>${dia}:</span>  <span>${formatter.format(total)}</span>`
               div.appendChild(card)
             }
            
        }else{
          alert("Preechar os campos em branco")
          return
        }
    }
    function remover(){
      
    }


