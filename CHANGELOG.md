# 25/10/2024

### Rotas da API

- **POST /register**: Rota para registrar um novo usuário na aplicação.
- **POST /login**: Rota para autenticar um usuário na aplicação.
- **POST /upload**: Rota para enviar um arquivo para o servidor.
- **POST /recover**: Rota para recuperar a senha de um usuário.
- **GET /recover/:token**: Rota para verificar se o token de recuperação de senha é válido.
- **GET /secure**: Rota para testar a autenticação do usuário.

### Mudanças

- A rota `/login` agora retorna um token de autenticação que é salvo nos cookies do navegador. [main.js](main.js#L177-L184)
- A rota `/secure` agora utiliza um middleware para verificar se o usuário está autenticado. [main.js](main.js#L37-L47)
- Adicionado um **logger** para registrar as requisições feitas para a API. [logger.js](./util/logger.js)

### Logger

O **logger** é um módulo que registra as requisições feitas para a API. Ele é utilizado para monitorar o tráfego de dados para que seja possível analizá-lo posteriormente.

- Funcionamento:
    - O **logger** registra as requisições feitas para a API em um arquivo de log e ao console da aplicação.
    - Ele armazena informações como o método HTTP, a rota acessada, o IP do usuário, a data e a hora da requisição.
    - O arquivo de log é salvo no diretório especificado pelo usuário (como padrão, a pasta `./logs`) na raiz do projeto.

### Exemplo de Log
```
2024-10-25T15:00:00 [GET] - /secure - ::1 (Exemplo de requisição)
2024-10-25T15:00:10 [200] - /secure - 10ms (Exemplo de resposta)
```

# 29/10/2024

### Rotas da API
- **POST /register**: Rota para registrar um novo usuário na aplicação.
- **POST /login**: Rota para autenticar um usuário na aplicação.
- **POST /upload**: Rota para enviar um arquivo para o servidor.
- **POST /recover**: Rota para recuperar a senha de um usuário.
- **GET /recover/:token**: Rota para verificar se o token de recuperação de senha é válido.
- **GET /secure**: Rota para testar a autenticação do usuário.
- **GET /events**: Rota para receber todos os eventos do colégio.
- **POST /events**: Rota para criar um novo evento.
- **DELETE /events/:id**: Rota para deletar um evento.
- **PATCH /events/:id**: Rota para alterar informações sobre o evento.
- **PATCH /events/like/:id**: Rota para adicionar um __like__ ao evento.
- **PATCH /events/image/:id**: Rota para alterar a imagem do evento.

### Mudanças

- Adicionado as rotas `GET, POST /events`, `DELETE, PATCH /events/:id`, `PATCH /events/like/:id` e `PATCH /events/image/:id` e as suas respectivas funcionalidades. [main.js](main.js)
