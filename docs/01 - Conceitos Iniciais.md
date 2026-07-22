# Conceitos importantes do NestJS neste projeto

Este documento explica os principais conceitos usados na `finance-api`, sempre com exemplos reais do próprio código.

---

## 1. Injeção de Dependências (DI)

### O problema que ela resolve

Sem injeção de dependências, cada classe precisaria **criar** suas próprias dependências:

```ts
// ❌ SEM injeção de dependências
export class CategoriesController {
  private categoriesService = new CategoriesService(new PrismaService());
}
```

Problemas dessa abordagem:

- O controller precisa saber **como construir** o service (e tudo que o service precisa, como o `PrismaService`).
- Cada `new` cria uma **instância nova** — teríamos várias conexões com o banco.
- Fica difícil testar: não dá para substituir o service por um mock facilmente.

### Como o Nest resolve

Você apenas **declara** o que precisa no construtor, e o Nest entrega a instância pronta:

```ts
// ✅ COM injeção de dependências — categories.controller.ts
@Controller('categories')
export class CategoriesController {
  // injeção via construtor - o Nest cria o categoriesService e entrega aqui
  constructor(private readonly categoriesService: CategoriesService) {}
}
```

O mesmo acontece em cadeia: o `CategoriesService` também não cria o Prisma, ele **recebe**:

```ts
// categories.service.ts
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
}
```

### Como o Nest sabe o que entregar?

1. O decorator `@Injectable()` marca a classe como um **provider** — algo que o Nest pode criar e gerenciar.
2. O tipo do parâmetro no construtor (`CategoriesService`, `PrismaService`) funciona como um **token**: o Nest olha o tipo e procura no seu "container" quem corresponde a ele.
3. Por padrão, cada provider é **singleton**: o Nest cria **uma única instância** e reutiliza em todo lugar que pedir. Por isso só existe uma conexão com o banco, mesmo com vários services usando o `PrismaService`.

### A cadeia completa neste projeto

```
CategoriesController
        │  precisa de
        ▼
CategoriesService (@Injectable)
        │  precisa de
        ▼
PrismaService (@Injectable, extends PrismaClient)
        │
        ▼
   Banco de dados
```

Quando a aplicação sobe, o Nest monta essa árvore de trás para frente: cria o `PrismaService`, injeta no `CategoriesService`, e injeta esse no `CategoriesController`.

---

## 2. Módulos — a organização do container

A DI não é global e ilimitada: os **módulos** definem quem enxerga quem.

```ts
// categories.module.ts
@Module({
  imports: [PrismaModule],           // "eu quero usar o que o PrismaModule exporta"
  controllers: [CategoriesController],
  providers: [CategoriesService],    // "eu sou dono do CategoriesService"
})
export class CategoriesModule {}
```

```ts
// prisma.module.ts
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 essencial: sem isso, outros módulos não conseguem injetar o PrismaService
})
export class PrismaModule {}
```

Regras importantes:

- **`providers`**: classes que o módulo registra no container. Por padrão são **privadas** ao módulo.
- **`exports`**: torna um provider visível para quem importar o módulo. Se você remover `exports: [PrismaService]`, o `CategoriesService` quebra na inicialização com um erro do tipo *"Nest can't resolve dependencies of the CategoriesService"*.
- **`imports`**: dá acesso aos exports de outro módulo.

O `AppModule` é a raiz que amarra tudo:

```ts
// app.module.ts
@Module({
  imports: [CategoriesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 3. Controllers e roteamento

O controller é a "porta de entrada" HTTP. Decorators mapeiam rotas para métodos:

```ts
@Controller('categories')        // prefixo: todas as rotas começam com /categories
export class CategoriesController {
  @Get()                         // GET  /categories
  @Get(':id')                    // GET  /categories/42
  @Post()                        // POST /categories
  @Patch(':id')                  // PATCH /categories/42
  @Delete(':id')                 // DELETE /categories/42
}
```

Decorators de parâmetro extraem partes da requisição:

- `@Param('id')` — pega o pedaço `:id` da URL.
- `@Body()` — pega o corpo JSON da requisição.

O controller deve ser **fino**: só recebe a requisição e delega para o service. Toda a regra de negócio (checar se existe, lançar 404, falar com o banco) fica no `CategoriesService`.

---

## 4. DTOs e validação

Um **DTO (Data Transfer Object)** define o formato dos dados que entram na API:

```ts
// dto/create-category.dto.ts
export class CreateCategoryDto {
  @IsString()      // precisa ser string
  @IsNotEmpty()    // não pode ser vazio
  @MaxLength(50)   // limite de tamanho
  name!: string;
}
```

Os decorators do `class-validator` só funcionam porque em `main.ts` ativamos o pipe global:

```ts
// main.ts
app.useGlobalPipes(new ValidationPipe());
```

Fluxo de uma requisição `POST /categories`:

1. O JSON do body chega.
2. O `ValidationPipe` transforma o JSON em uma instância de `CreateCategoryDto`.
3. Valida cada decorator. Se algo falhar → resposta **400 Bad Request** automática, com a lista de erros. O código do controller nem chega a rodar.

O `UpdateCategoryDto` usa `PartialType(CreateCategoryDto)`, que torna todos os campos opcionais — ideal para `PATCH`, onde o cliente manda só o que quer alterar.

---

## 5. Pipes

Pipes transformam e validam dados **antes** de chegarem no método. Neste projeto usamos dois:

- **`ValidationPipe`** (global) — valida DTOs, visto acima.
- **`ParseIntPipe`** (por parâmetro):

```ts
findOne(@Param('id', ParseIntPipe) id: number) { ... }
```

Parâmetros de URL sempre chegam como **string** (`"42"`). O `ParseIntPipe` converte para `number` e, se não for um número válido (`GET /categories/abc`), retorna **400** automaticamente.

---

## 6. Lifecycle hooks

O Nest permite executar código em momentos do ciclo de vida da aplicação. O `PrismaService` usa dois:

```ts
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();    // abre a conexão quando o módulo inicializa
  }

  async onModuleDestroy() {
    await this.$disconnect(); // fecha a conexão quando a app desliga
  }
}
```

Repare também no `extends PrismaClient`: o service **herda** todos os métodos de query gerados pelo Prisma (`this.prisma.category.findMany()`, etc.), e ao mesmo tempo é um `@Injectable()` que participa da DI. É o padrão recomendado para integrar Prisma com Nest.

---

## 7. Tratamento de erros com exceções HTTP

Em vez de retornar códigos de erro manualmente, lançamos exceções que o Nest converte em respostas HTTP:

```ts
// categories.service.ts
if (!category) {
  throw new NotFoundException(`Categoria com id ${id} não encontrada`);
}
```

O `NotFoundException` vira automaticamente uma resposta **404** com corpo JSON padronizado. Outros exemplos prontos: `BadRequestException` (400), `ConflictException` (409), `ForbiddenException` (403).

Repare o reaproveitamento no service: `update` e `remove` chamam `this.findOne(id)` antes de agir — assim a checagem de existência e o 404 ficam em um lugar só.

---

## 8. Resumo da arquitetura

```
Requisição HTTP
      │
      ▼
ValidationPipe / ParseIntPipe   (valida e transforma)
      │
      ▼
CategoriesController            (roteia, extrai params/body)
      │
      ▼
CategoriesService               (regra de negócio, erros HTTP)
      │
      ▼
PrismaService                   (acesso ao banco, ciclo de vida da conexão)
      │
      ▼
Banco de dados
```

Cada camada tem uma responsabilidade única, e a **injeção de dependências** é a cola que conecta todas elas sem que nenhuma precise saber como construir a outra.
