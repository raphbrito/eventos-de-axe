# Configuração do 40tou da Mari

## Dados do convite

Edite `js/dados-evento.js` quando a festa tiver data, horário, local, endereço, links de rota e orientações de traje confirmados.

Para ativar a contagem, preencha `evento.inicio` com data, horário e fuso, por exemplo:

```js
inicio: "2027-01-23T20:00:00-03:00"
```

Enquanto esse campo estiver vazio, o convite mostra corretamente o estado de informações pendentes e não cria uma contagem incorreta.

## Formulário de RSVP

O formulário público inicialmente informado está indisponível e retornou uma página de arquivo excluído. Cole o novo link público em `rsvp.url` antes de divulgar o convite.

## Painel de RSVP

O painel usa a autenticação central já configurada em `assets/js/config.js`. Para ele receber respostas reais:

1. No painel global de Eventos de Axé, crie o evento com:
   - nome: `40tou da Mari`;
   - slug: `40tou-da-mari`;
   - ID da planilha de respostas do Google Forms;
   - nome exato da aba de respostas.
2. Libere o acesso administrativo necessário pelo mecanismo central.
3. Confira os títulos e valores reais das colunas da planilha antes de alterar o processamento do Apps Script.

O link da planilha e seus cabeçalhos não foram fornecidos nesta implementação. Por isso, nenhum dado de RSVP foi simulado ou cadastrado automaticamente.
