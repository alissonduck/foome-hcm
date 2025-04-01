# Padrão para APIs REST

Este documento descreve o padrão a ser seguido para a implementação de todas as APIs REST do sistema.

## Estrutura de Pastas

Para cada recurso principal, a estrutura de pastas deve ser organizada da seguinte forma:

```
/app/api/[recurso]/route.ts          # Endpoints para coleção (GET, POST)
/app/api/[recurso]/[id]/route.ts     # Endpoints para item específico (GET, PUT, PATCH, DELETE)
/app/api/[recurso]/[...outros]/route.ts  # Endpoints para operações especiais
```

## Camadas da Arquitetura

Para garantir separação de responsabilidades, cada endpoint deve seguir a seguinte estrutura de camadas:

1. **Rotas API** (`/app/api/`): Responsáveis apenas por receber requisições, validar permissões, chamar serviços e retornar respostas.
2. **Schemas** (`/lib/schemas/`): Validação de dados de entrada com Zod.
3. **Services** (`/lib/services/`): Lógica de negócio e operações com o banco de dados.
4. **Server Actions** (`/server/actions/`): Ações do servidor que podem ser reutilizadas.
5. **Utilitários** (`/lib/utils/`): Funções auxiliares como formatação de respostas.
6. **Hooks** (`/hooks/`): Para consumo das APIs no frontend.

## Padronização de Respostas

Todas as respostas devem seguir o formato padrão utilizando as funções `successResponse` e `errorResponse`:

### Resposta de Sucesso
```json
{
  "success": true,
  "data": [...],
  "message": "Mensagem de sucesso",
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

### Resposta de Erro
```json
{
  "success": false,
  "error": {
    "message": "Mensagem de erro",
    "details": "Detalhes do erro",
    "code": "VALIDATION_ERROR"
  }
}
```

## Métodos HTTP por Endpoint

Cada recurso deve implementar os seguintes métodos HTTP:

### Coleção (`/api/[recurso]/`)

- **GET**: Lista recursos com suporte para paginação, filtros e ordenação
- **POST**: Cria um novo recurso
- **PUT/PATCH/DELETE**: Retorna erro orientando a usar o endpoint específico

### Item (`/api/[recurso]/[id]`)

- **GET**: Obtém um recurso específico
- **PUT**: Atualização completa do recurso
- **PATCH**: Atualização parcial do recurso
- **DELETE**: Remove o recurso

## Segurança e Validação

Cada endpoint deve implementar:

1. **Autenticação**: Verificar se o usuário está autenticado
2. **Autorização**: Verificar se o usuário tem permissão para a operação
3. **Validação de dados**: Usar schemas Zod para validar dados de entrada
4. **Validação de acesso**: Verificar se o recurso pertence à empresa do usuário

## Códigos de Status HTTP

Utilizar os códigos de status HTTP de forma consistente:

- **200 OK**: Operação bem-sucedida (GET, PUT, PATCH)
- **201 Created**: Recurso criado com sucesso (POST)
- **204 No Content**: Operação bem-sucedida sem conteúdo a retornar (DELETE)
- **400 Bad Request**: Requisição inválida
- **401 Unauthorized**: Usuário não autenticado
- **403 Forbidden**: Usuário não tem permissão
- **404 Not Found**: Recurso não encontrado
- **422 Unprocessable Entity**: Dados de entrada inválidos
- **500 Internal Server Error**: Erro interno no servidor

## Códigos de Erro

Utilizar códigos de erro padronizados para facilitar o tratamento no frontend:

- **VALIDATION_ERROR**: Erro de validação de dados
- **AUTHENTICATION_ERROR**: Erro de autenticação
- **AUTHORIZATION_ERROR**: Erro de autorização
- **RESOURCE_NOT_FOUND**: Recurso não encontrado
- **RESOURCE_CONFLICT**: Conflito de recursos
- **INTERNAL_ERROR**: Erro interno

## Performance e Otimização

Para garantir a performance das APIs:

1. **Paginação**: Implementar em todos os endpoints que retornam listas
2. **Filtros**: Permitir filtrar dados por campos relevantes
3. **Ordenação**: Permitir ordenar por campos relevantes
4. **Seleção de campos**: Permitir selecionar apenas os campos necessários

## Exemplo de Implementação

Ver os arquivos:
- `/app/api/employees/route.ts`
- `/app/api/employees/[id]/route.ts`
- `/lib/services/employee-service.ts`
- `/lib/utils/api-response.ts`

## Processo de Refatoração

Para refatorar as APIs existentes:

1. Implementar o utilitário de resposta padronizada
2. Refatorar os serviços para garantir métodos consistentes
3. Refatorar as rotas API seguindo o padrão
4. Atualizar hooks do frontend para consumir as novas APIs

## Documentação

Cada endpoint deve ser documentado com comentários JSDoc que explicam:

1. O propósito do endpoint
2. Os parâmetros de entrada
3. As permissões necessárias
4. Os possíveis erros
5. O formato da resposta 