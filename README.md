# Previsão do Tempo - Amplimed

O projeto faz a consulta da Previsão do Tempo através da API Weaterstack (https://weatherstack.com/), e permite o usuário salvar os dados consultados e também comparar com outra cidade.
Caso o usuário queira, também é permitido visualizar o histórico da Previsão do Tempo da cidade consultada.

## Demonstração

![Demonstração da Aplicação](src/assets/images/Previsão-do-Tempo-Tutorial.gif)

## Tecnologias Utilizadas
    - **React**: v18.3.1
    - **Bootstrap**: v2.10.4
    - **Axios**: v1.7.4
    - **React Icons**: v5.3.0
    - **React Toastify**: v10.0.5

## Estrutura de Pastas

Como é um projeto simples, foi optado pelo desenvolvimento direto no arquivo App.js.
Foi criada uma pasta `config` dentro de src e um arquivo apiConfig.js com o endereço de conexão da API.
Também foi criada uma pasta dentro de src, chamada `assets`, que serve para organizar e armazenar recursos estáticos como imagens, ícones, fontes, GIFs e outros arquivos que não são códigos, mas que são necessários para o funcionamento ou design da aplicação.

## Instalação

1. Clone o repositório:
    ```bash
   git clone https://github.com/joecangu/previsao_tempo.git

2. Navegue até o diretório do projeto:
    cd previsao_tempo

3. Instale as dependências:
    npm install

## Como Usar
1. Para rodar o projeto em modo de desenvolvimento:
    npm start

2. Abra http://localhost:3000 para ver o projeto no navegador.

