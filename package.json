# PokéAPI — Documentação Completa

> Documentação de referência para consumo da PokéAPI v2 e construção de um portal completo e responsivo.

---

## Índice

1. [Informações Gerais](#1-informações-gerais)
2. [Política de Uso Justo](#2-política-de-uso-justo)
3. [Paginação e Listas de Recursos](#3-paginação-e-listas-de-recursos)
4. [Grupos de Endpoints](#4-grupos-de-endpoints)
   - 4.1 [Berries (Frutas)](#41-berries-frutas)
   - 4.2 [Contests (Concursos)](#42-contests-concursos)
   - 4.3 [Encounters (Encontros)](#43-encounters-encontros)
   - 4.4 [Evolution (Evolução)](#44-evolution-evolução)
   - 4.5 [Games (Jogos)](#45-games-jogos)
   - 4.6 [Items (Itens)](#46-items-itens)
   - 4.7 [Locations (Localizações)](#47-locations-localizações)
   - 4.8 [Machines (Máquinas/TMs)](#48-machines-máquinastms)
   - 4.9 [Moves (Movimentos)](#49-moves-movimentos)
   - 4.10 [Pokémon](#410-pokémon)
   - 4.11 [Utility (Utilitários)](#411-utility-utilitários)
5. [Modelos Comuns](#5-modelos-comuns)
6. [Guia Prático: Construindo um Portal Completo](#6-guia-prático-construindo-um-portal-completo)
   - 6.1 [Estrutura de Projeto Sugerida](#61-estrutura-de-projeto-sugerida)
   - 6.2 [Configuração Base e Cache](#62-configuração-base-e-cache)
   - 6.3 [Listagem de Pokémon com Paginação](#63-listagem-de-pokémon-com-paginação)
   - 6.4 [Detalhes de um Pokémon](#64-detalhes-de-um-pokémon)
   - 6.5 [Exibindo Sprites e Imagens](#65-exibindo-sprites-e-imagens)
   - 6.6 [Cadeia Evolutiva](#66-cadeia-evolutiva)
   - 6.7 [Busca e Filtros](#67-busca-e-filtros)
   - 6.8 [Design Responsivo — Boas Práticas](#68-design-responsivo--boas-práticas)
7. [Bibliotecas Wrapper](#7-bibliotecas-wrapper)
8. [Referência Rápida de Endpoints](#8-referência-rápida-de-endpoints)

---

## 1. Informações Gerais

| Atributo | Valor |
|---|---|
| URL Base | `https://pokeapi.co/api/v2/` |
| Versão atual | v2 |
| Método HTTP suportado | Somente `GET` |
| Autenticação | Não requerida |
| Rate Limiting | Nenhum (desde novembro de 2018) |
| Formato de resposta | JSON |

A PokéAPI é uma API **somente de leitura** (consumption-only). Nenhum recurso pode ser criado, atualizado ou deletado via API.

Todos os recursos são públicos e abertos. Embora não haja rate limiting, **o cache local é fortemente recomendado** para reduzir custos de hospedagem e melhorar a performance da sua aplicação.

---

## 2. Política de Uso Justo

Para manter a API gratuita e acessível a todos, siga as regras abaixo:

- **Faça cache local** de todos os recursos que você requisitar.
- Seja respeitoso com outros desenvolvedores que usam a API.
- Reporte vulnerabilidades de segurança de forma responsável.
- **Não realize ataques de negação de serviço (DoS).** IPs que violarem isso serão banidos permanentemente.

---

## 3. Paginação e Listas de Recursos

Chamar qualquer endpoint **sem um ID ou nome** retorna uma lista paginada de recursos disponíveis. Por padrão, cada página contém até **20 recursos**.

### Parâmetros de Query

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `limit` | `integer` | Número de itens por página (ex: `?limit=60`) |
| `offset` | `integer` | Pular N itens (ex: `?offset=20`) |

### Exemplo de Requisição

```
GET https://pokeapi.co/api/v2/pokemon/?limit=20&offset=0
```

### Resposta — Lista Nomeada (`NamedAPIResourceList`)

```json
{
  "count": 1302,
  "next": "https://pokeapi.co/api/v2/pokemon/?limit=20&offset=20",
  "previous": null,
  "results": [
    { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" },
    { "name": "ivysaur",   "url": "https://pokeapi.co/api/v2/pokemon/2/" }
  ]
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `count` | `integer` | Total de recursos disponíveis |
| `next` | `string` | URL da próxima página (ou `null`) |
| `previous` | `string` | URL da página anterior (ou `null`) |
| `results` | `list` | Lista de recursos nomeados |

> **Endpoints sem nome** (como `evolution-chain`, `machine`, `contest-effect`) retornam o tipo `APIResourceList`, onde cada item contém apenas `url`, sem o campo `name`.

---

## 4. Grupos de Endpoints

---

### 4.1 Berries (Frutas)

Berries são pequenas frutas que podem restaurar HP, curar status, melhorar atributos ou negar danos quando consumidas por Pokémon.

#### `GET /berry/{id or name}/`

```
https://pokeapi.co/api/v2/berry/cheri/
```

**Tipo: `Berry`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome da berry |
| `growth_time` | `integer` | Tempo (em horas) para crescer um estágio; a árvore passa por 4 estágios |
| `max_harvest` | `integer` | Máximo de berries que podem crescer numa árvore (Gen IV) |
| `natural_gift_power` | `integer` | Poder do movimento "Natural Gift" ao usar esta berry |
| `size` | `integer` | Tamanho da berry em milímetros |
| `smoothness` | `integer` | Suavidade, usada para fazer Pokéblocks ou Poffins |
| `soil_dryness` | `integer` | Velocidade com que a berry resseca o solo |
| `firmness` | `NamedAPIResource(BerryFirmness)` | Firmeza da berry |
| `flavors` | `list BerryFlavorMap` | Sabores e potências desta berry |
| `item` | `NamedAPIResource(Item)` | Item correspondente a esta berry |
| `natural_gift_type` | `NamedAPIResource(Type)` | Tipo herdado por "Natural Gift" ao usar esta berry |

**Tipo: `BerryFlavorMap`**

| Campo | Tipo | Descrição |
|---|---|---|
| `potency` | `integer` | Potência do sabor para esta berry |
| `flavor` | `NamedAPIResource(BerryFlavor)` | Sabor referenciado |

---

#### `GET /berry-firmness/{id or name}/`

**Tipo: `BerryFirmness`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `very-soft`, `soft`, `hard`) |
| `berries` | `list NamedAPIResource(Berry)` | Berries com esta firmeza |
| `names` | `list Name` | Nome em diferentes idiomas |

---

#### `GET /berry-flavor/{id or name}/`

**Tipo: `BerryFlavor`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `spicy`, `dry`, `sweet`) |
| `berries` | `list FlavorBerryMap` | Berries com este sabor |
| `contest_type` | `NamedAPIResource(ContestType)` | Tipo de concurso relacionado |
| `names` | `list Name` | Nome em diferentes idiomas |

**Tipo: `FlavorBerryMap`**

| Campo | Tipo | Descrição |
|---|---|---|
| `potency` | `integer` | Potência do sabor |
| `berry` | `NamedAPIResource(Berry)` | Berry referenciada |

---

### 4.2 Contests (Concursos)

Concursos são eventos em que Pokémon competem baseados em suas condições.

#### `GET /contest-type/{id or name}/`

**Tipo: `ContestType`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `cool`, `beautiful`, `cute`) |
| `berry_flavor` | `NamedAPIResource(BerryFlavor)` | Sabor de berry correlacionado |
| `names` | `list ContestName` | Nome do concurso em diferentes idiomas |

**Tipo: `ContestName`**

| Campo | Tipo | Descrição |
|---|---|---|
| `name` | `string` | Nome do concurso |
| `color` | `string` | Cor associada |
| `language` | `NamedAPIResource(Language)` | Idioma |

---

#### `GET /contest-effect/{id}/`

Efeitos de movimentos quando usados em concursos.

**Tipo: `ContestEffect`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `appeal` | `integer` | Número base de corações ganhos |
| `jam` | `integer` | Número base de corações que o oponente perde |
| `effect_entries` | `list Effect` | Efeito em diferentes idiomas |
| `flavor_text_entries` | `list ContestEffectFlavorText` | Flavor text em diferentes idiomas |

---

#### `GET /super-contest-effect/{id}/`

**Tipo: `SuperContestEffect`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `appeal` | `integer` | Nível de apelo no super concurso |
| `flavor_text_entries` | `list SuperContestEffectFlavorText` | Flavor text em diferentes idiomas |
| `moves` | `list NamedAPIResource(Move)` | Movimentos que possuem este efeito |

---

### 4.3 Encounters (Encontros)

#### `GET /encounter-method/{id or name}/`

Métodos pelos quais o jogador pode encontrar Pokémon selvagens (ex: andar na grama alta).

**Tipo: `EncounterMethod`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `walk`, `surf`, `fishing`) |
| `order` | `integer` | Valor para ordenação |
| `names` | `list Name` | Nome em diferentes idiomas |

---

#### `GET /encounter-condition/{id or name}/`

Condições que afetam quais Pokémon podem aparecer (ex: dia ou noite).

**Tipo: `EncounterCondition`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `time-of-day`, `swarm`) |
| `names` | `list Name` | Nome em diferentes idiomas |
| `values` | `list NamedAPIResource(EncounterConditionValue)` | Valores possíveis |

---

#### `GET /encounter-condition-value/{id or name}/`

**Tipo: `EncounterConditionValue`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `time-morning`, `swarm-yes`) |
| `condition` | `NamedAPIResource(EncounterCondition)` | Condição relacionada |
| `names` | `list Name` | Nome em diferentes idiomas |

---

### 4.4 Evolution (Evolução)

#### `GET /evolution-chain/{id}/`

Cadeias evolutivas começam pelo estágio mais baixo e detalham as condições para cada evolução.

**Tipo: `EvolutionChain`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `baby_trigger_item` | `NamedAPIResource(Item)` | Item necessário para choca um Pokémon bebê (ou `null`) |
| `chain` | `ChainLink` | Link base da cadeia |

**Tipo: `ChainLink`**

| Campo | Tipo | Descrição |
|---|---|---|
| `is_baby` | `boolean` | Se este link é um Pokémon bebê |
| `species` | `NamedAPIResource(PokemonSpecies)` | Espécie neste ponto da cadeia |
| `evolution_details` | `list EvolutionDetail` | Detalhes das condições de evolução |
| `evolves_to` | `list ChainLink` | Próximas evoluções |

**Tipo: `EvolutionDetail`**

| Campo | Tipo | Descrição |
|---|---|---|
| `item` | `NamedAPIResource(Item)` | Item necessário para evoluir |
| `trigger` | `NamedAPIResource(EvolutionTrigger)` | Tipo de evento que desencadeia a evolução |
| `gender` | `integer` | ID do gênero requerido |
| `held_item` | `NamedAPIResource(Item)` | Item que o Pokémon deve segurar |
| `known_move` | `NamedAPIResource(Move)` | Movimento que o Pokémon deve conhecer |
| `known_move_type` | `NamedAPIResource(Type)` | Tipo de movimento que deve ser conhecido |
| `location` | `NamedAPIResource(Location)` | Local onde a evolução deve ocorrer |
| `min_level` | `integer` | Nível mínimo requerido |
| `min_happiness` | `integer` | Felicidade mínima requerida |
| `min_beauty` | `integer` | Beleza mínima requerida |
| `min_affection` | `integer` | Afeição mínima requerida |
| `needs_overworld_rain` | `boolean` | Se deve estar chovendo no overworld |
| `party_species` | `NamedAPIResource(PokemonSpecies)` | Espécie que deve estar no grupo |
| `party_type` | `NamedAPIResource(Type)` | Tipo de Pokémon que deve estar no grupo |
| `relative_physical_stats` | `integer` | Relação entre Ataque e Defesa (1, 0 ou -1) |
| `time_of_day` | `string` | Horário requerido (`day` ou `night`) |
| `trade_species` | `NamedAPIResource(PokemonSpecies)` | Espécie com a qual deve ser trocado |
| `turn_upside_down` | `boolean` | Se o 3DS deve ser virado de cabeça para baixo |

---

#### `GET /evolution-trigger/{id or name}/`

**Tipo: `EvolutionTrigger`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `level-up`, `trade`, `use-item`) |
| `names` | `list Name` | Nome em diferentes idiomas |
| `pokemon_species` | `list NamedAPIResource(PokemonSpecies)` | Espécies que evoluem por este trigger |

---

### 4.5 Games (Jogos)

#### `GET /generation/{id or name}/`

Uma geração é um agrupamento de jogos Pokémon baseado nos Pokémon, movimentos, habilidades e tipos que incluem.

**Tipo: `Generation`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `generation-i`) |
| `abilities` | `list NamedAPIResource(Ability)` | Habilidades introduzidas nesta geração |
| `names` | `list Name` | Nome em diferentes idiomas |
| `main_region` | `NamedAPIResource(Region)` | Região principal desta geração |
| `moves` | `list NamedAPIResource(Move)` | Movimentos introduzidos nesta geração |
| `pokemon_species` | `list NamedAPIResource(PokemonSpecies)` | Espécies introduzidas nesta geração |
| `types` | `list NamedAPIResource(Type)` | Tipos introduzidos nesta geração |
| `version_groups` | `list NamedAPIResource(VersionGroup)` | Grupos de versão desta geração |

---

#### `GET /pokedex/{id or name}/`

**Tipo: `Pokedex`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `kanto`, `national`) |
| `is_main_series` | `boolean` | Se originou na série principal |
| `descriptions` | `list Description` | Descrição em diferentes idiomas |
| `names` | `list Name` | Nome em diferentes idiomas |
| `pokemon_entries` | `list PokemonEntry` | Pokémon catalogados e seus índices |
| `region` | `NamedAPIResource(Region)` | Região catalogada |
| `version_groups` | `list NamedAPIResource(VersionGroup)` | Grupos de versão relevantes |

**Tipo: `PokemonEntry`**

| Campo | Tipo | Descrição |
|---|---|---|
| `entry_number` | `integer` | Número no Pokédex |
| `pokemon_species` | `NamedAPIResource(PokemonSpecies)` | Espécie catalogada |

---

#### `GET /version/{id or name}/`

**Tipo: `Version`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `red`, `blue`, `gold`) |
| `names` | `list Name` | Nome em diferentes idiomas |
| `version_group` | `NamedAPIResource(VersionGroup)` | Grupo de versão ao qual pertence |

---

#### `GET /version-group/{id or name}/`

**Tipo: `VersionGroup`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `red-blue`, `gold-silver`) |
| `order` | `integer` | Ordem de lançamento |
| `generation` | `NamedAPIResource(Generation)` | Geração deste grupo |
| `move_learn_methods` | `list NamedAPIResource(MoveLearnMethod)` | Métodos de aprendizado de movimentos |
| `pokedexes` | `list NamedAPIResource(Pokedex)` | Pokédexes deste grupo |
| `regions` | `list NamedAPIResource(Region)` | Regiões visitáveis |
| `versions` | `list NamedAPIResource(Version)` | Versões deste grupo |

---

### 4.6 Items (Itens)

#### `GET /item/{id or name}/`

Itens são objetos que o jogador pode pegar, guardar na mochila e usar.

**Tipo: `Item`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `master-ball`, `potion`) |
| `cost` | `integer` | Preço nas lojas |
| `fling_power` | `integer` | Poder do movimento Fling com este item |
| `fling_effect` | `NamedAPIResource(ItemFlingEffect)` | Efeito do Fling com este item |
| `attributes` | `list NamedAPIResource(ItemAttribute)` | Atributos do item |
| `category` | `NamedAPIResource(ItemCategory)` | Categoria |
| `effect_entries` | `list VerboseEffect` | Efeito em diferentes idiomas |
| `flavor_text_entries` | `list VersionGroupFlavorText` | Flavor text por versão |
| `game_indices` | `list GenerationGameIndex` | Índices do jogo por geração |
| `names` | `list Name` | Nome em diferentes idiomas |
| `sprites` | `ItemSprites` | Sprite do item |
| `held_by_pokemon` | `list ItemHolderPokemon` | Pokémon que seguram este item |
| `baby_trigger_for` | `APIResource(EvolutionChain)` | Cadeia evolutiva que requer este item |
| `machines` | `list MachineVersionDetail` | Máquinas relacionadas ao item |

**Tipo: `ItemSprites`**

| Campo | Tipo | Descrição |
|---|---|---|
| `default` | `string` | URL da sprite padrão do item |

---

#### `GET /item-attribute/{id or name}/`

**Tipo: `ItemAttribute`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `countable`, `consumable`, `holdable`) |
| `items` | `list NamedAPIResource(Item)` | Itens com este atributo |
| `names` | `list Name` | Nome em diferentes idiomas |
| `descriptions` | `list Description` | Descrição em diferentes idiomas |

---

#### `GET /item-category/{id or name}/`

**Tipo: `ItemCategory`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome da categoria |
| `items` | `list NamedAPIResource(Item)` | Itens nesta categoria |
| `names` | `list Name` | Nome em diferentes idiomas |
| `pocket` | `NamedAPIResource(ItemPocket)` | Bolso da mochila onde o item vai |

---

#### `GET /item-fling-effect/{id or name}/`

**Tipo: `ItemFlingEffect`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome do efeito |
| `effect_entries` | `list Effect` | Efeito em diferentes idiomas |
| `items` | `list NamedAPIResource(Item)` | Itens com este efeito de Fling |

---

#### `GET /item-pocket/{id or name}/`

**Tipo: `ItemPocket`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome do bolso (ex: `misc`, `medicine`, `pokeballs`) |
| `categories` | `list NamedAPIResource(ItemCategory)` | Categorias neste bolso |
| `names` | `list Name` | Nome em diferentes idiomas |

---

### 4.7 Locations (Localizações)

#### `GET /location/{id or name}/`

**Tipo: `Location`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `canalave-city`) |
| `region` | `NamedAPIResource(Region)` | Região onde a localização fica |
| `names` | `list Name` | Nome em diferentes idiomas |
| `game_indices` | `list GenerationGameIndex` | Índices por geração |
| `areas` | `list NamedAPIResource(LocationArea)` | Áreas dentro desta localização |

---

#### `GET /location-area/{id or name}/`

**Tipo: `LocationArea`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome da área |
| `game_index` | `integer` | Índice interno no jogo |
| `encounter_method_rates` | `list EncounterMethodRate` | Métodos de encontro e taxas por versão |
| `location` | `NamedAPIResource(Location)` | Localização pai |
| `names` | `list Name` | Nome em diferentes idiomas |
| `pokemon_encounters` | `list PokemonEncounter` | Pokémon que podem ser encontrados |

**Tipo: `EncounterMethodRate`**

| Campo | Tipo | Descrição |
|---|---|---|
| `encounter_method` | `NamedAPIResource(EncounterMethod)` | Método de encontro |
| `version_details` | `list EncounterVersionDetails` | Chance de ocorrer por versão |

**Tipo: `PokemonEncounter`**

| Campo | Tipo | Descrição |
|---|---|---|
| `pokemon` | `NamedAPIResource(Pokemon)` | Pokémon encontrado |
| `version_details` | `list VersionEncounterDetail` | Detalhes de encontro por versão |

---

#### `GET /pal-park-area/{id or name}/`

**Tipo: `PalParkArea`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome da área (ex: `forest`, `field`, `mountain`) |
| `names` | `list Name` | Nome em diferentes idiomas |
| `pokemon_encounters` | `list PalParkEncounterSpecies` | Pokémon encontrados nesta área |

---

#### `GET /region/{id or name}/`

**Tipo: `Region`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `kanto`, `johto`, `hoenn`) |
| `locations` | `list NamedAPIResource(Location)` | Localizações nesta região |
| `names` | `list Name` | Nome em diferentes idiomas |
| `main_generation` | `NamedAPIResource(Generation)` | Geração principal desta região |
| `pokedexes` | `list NamedAPIResource(Pokedex)` | Pokédexes desta região |
| `version_groups` | `list NamedAPIResource(VersionGroup)` | Grupos de versão onde esta região pode ser visitada |

---

### 4.8 Machines (Máquinas/TMs)

#### `GET /machine/{id}/`

Máquinas são itens que ensinam movimentos a Pokémon (TMs e HMs). Variam por versão.

**Tipo: `Machine`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `item` | `NamedAPIResource(Item)` | Item TM/HM correspondente |
| `move` | `NamedAPIResource(Move)` | Movimento que esta máquina ensina |
| `version_group` | `NamedAPIResource(VersionGroup)` | Grupo de versão ao qual esta máquina pertence |

---

### 4.9 Moves (Movimentos)

#### `GET /move/{id or name}/`

Movimentos são as habilidades dos Pokémon em batalha. Cada Pokémon usa um movimento por turno.

**Tipo: `Move`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `pound`, `flamethrower`) |
| `accuracy` | `integer` | Precisão do movimento (%) |
| `effect_chance` | `integer` | Chance do efeito secundário ocorrer (%) |
| `pp` | `integer` | Power Points — número de usos |
| `priority` | `integer` | Prioridade de -8 a 8 (maior = mais rápido) |
| `power` | `integer` | Poder base (0 se não causar dano) |
| `contest_combos` | `ContestComboSets` | Combos em concursos |
| `contest_type` | `NamedAPIResource(ContestType)` | Tipo de apelo em concursos |
| `contest_effect` | `APIResource(ContestEffect)` | Efeito em concursos |
| `damage_class` | `NamedAPIResource(MoveDamageClass)` | Classe de dano (physical/special/status) |
| `effect_entries` | `list VerboseEffect` | Efeito em diferentes idiomas |
| `effect_changes` | `list AbilityEffectChange` | Efeitos anteriores por grupo de versão |
| `learned_by_pokemon` | `list NamedAPIResource(Pokemon)` | Pokémon que podem aprender este movimento |
| `flavor_text_entries` | `list MoveFlavorText` | Flavor text por versão |
| `generation` | `NamedAPIResource(Generation)` | Geração em que foi introduzido |
| `machines` | `list MachineVersionDetail` | Máquinas que ensinam este movimento |
| `meta` | `MoveMetaData` | Metadados do movimento |
| `names` | `list Name` | Nome em diferentes idiomas |
| `past_values` | `list PastMoveStatValues` | Valores anteriores por versão |
| `stat_changes` | `list MoveStatChange` | Mudanças de atributo causadas |
| `super_contest_effect` | `APIResource(SuperContestEffect)` | Efeito em super concursos |
| `target` | `NamedAPIResource(MoveTarget)` | Alvo do movimento |
| `type` | `NamedAPIResource(Type)` | Tipo do movimento |

**Tipo: `MoveMetaData`**

| Campo | Tipo | Descrição |
|---|---|---|
| `ailment` | `NamedAPIResource(MoveAilment)` | Status infligido |
| `category` | `NamedAPIResource(MoveCategory)` | Categoria do movimento |
| `min_hits` | `integer` | Mínimo de acertos (null = sempre 1) |
| `max_hits` | `integer` | Máximo de acertos (null = sempre 1) |
| `min_turns` | `integer` | Mínimo de turnos de efeito |
| `max_turns` | `integer` | Máximo de turnos de efeito |
| `drain` | `integer` | % de dano absorvido (positivo) ou recuo (negativo) |
| `healing` | `integer` | % de HP máximo do atacante restaurado |
| `crit_rate` | `integer` | Bônus de chance de acerto crítico |
| `ailment_chance` | `integer` | Probabilidade de causar ailment (%) |
| `flinch_chance` | `integer` | Probabilidade de causar flinch (%) |
| `stat_chance` | `integer` | Probabilidade de mudar um atributo (%) |

---

#### `GET /move-ailment/{id or name}/`

**Tipo: `MoveAilment`** — Status (ex: `paralysis`, `burn`, `sleep`, `freeze`)

---

#### `GET /move-battle-style/{id or name}/`

Estilos de movimentos no Battle Palace.

---

#### `GET /move-category/{id or name}/`

Categorias gerais de efeito dos movimentos.

---

#### `GET /move-damage-class/{id or name}/`

**Tipo: `MoveDamageClass`** — Classes: `physical`, `special`, `status`

---

#### `GET /move-learn-method/{id or name}/`

**Tipo: `MoveLearnMethod`** — Métodos: `level-up`, `egg`, `tutor`, `machine`

---

#### `GET /move-target/{id or name}/`

**Tipo: `MoveTarget`** — Alvos: `selected-pokemon`, `all-opponents`, `user`, etc.

---

### 4.10 Pokémon

#### `GET /ability/{id or name}/`

Habilidades fornecem efeitos passivos em batalha ou no overworld.

**Tipo: `Ability`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `stench`, `overgrow`, `blaze`) |
| `is_main_series` | `boolean` | Se originou na série principal |
| `generation` | `NamedAPIResource(Generation)` | Geração de origem |
| `names` | `list Name` | Nome em diferentes idiomas |
| `effect_entries` | `list VerboseEffect` | Efeito em diferentes idiomas |
| `effect_changes` | `list AbilityEffectChange` | Efeitos anteriores por versão |
| `flavor_text_entries` | `list AbilityFlavorText` | Flavor text por versão |
| `pokemon` | `list AbilityPokemon` | Pokémon que podem ter esta habilidade |

**Tipo: `AbilityPokemon`**

| Campo | Tipo | Descrição |
|---|---|---|
| `is_hidden` | `boolean` | Se é uma habilidade oculta |
| `slot` | `integer` | Slot da habilidade (1, 2 ou 3) |
| `pokemon` | `NamedAPIResource(Pokemon)` | Pokémon referenciado |

---

#### `GET /pokemon/{id or name}/`

O recurso principal. Pokémon são as criaturas do mundo Pokémon.

**Tipo: `Pokemon`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único (National Dex number) |
| `name` | `string` | Nome (ex: `bulbasaur`, `charizard`) |
| `base_experience` | `integer` | Experiência base ganha ao derrotar |
| `height` | `integer` | Altura em decímetros |
| `is_default` | `boolean` | `true` para a forma padrão da espécie |
| `order` | `integer` | Ordem de exibição (famílias agrupadas) |
| `weight` | `integer` | Peso em hectogramas |
| `abilities` | `list PokemonAbility` | Habilidades possíveis |
| `forms` | `list NamedAPIResource(PokemonForm)` | Formas disponíveis |
| `game_indices` | `list VersionGameIndex` | Índices por versão |
| `held_items` | `list PokemonHeldItem` | Itens que pode segurar no selvagem |
| `location_area_encounters` | `string` | URL para lista de encontros por área |
| `moves` | `list PokemonMove` | Movimentos e como aprende por versão |
| `past_types` | `list PokemonTypePast` | Tipos em gerações anteriores |
| `sprites` | `PokemonSprites` | Sprites do Pokémon |
| `cries` | `PokemonCries` | Gritos do Pokémon (URLs de áudio .ogg) |
| `species` | `NamedAPIResource(PokemonSpecies)` | Espécie deste Pokémon |
| `stats` | `list PokemonStat` | Atributos base |
| `types` | `list PokemonType` | Tipos do Pokémon |

**Tipo: `PokemonSprites`**

| Campo | Tipo | Descrição |
|---|---|---|
| `front_default` | `string` | Sprite frontal padrão |
| `front_shiny` | `string` | Sprite frontal shiny |
| `front_female` | `string` | Sprite frontal feminino |
| `front_shiny_female` | `string` | Sprite frontal shiny feminino |
| `back_default` | `string` | Sprite traseiro padrão |
| `back_shiny` | `string` | Sprite traseiro shiny |
| `back_female` | `string` | Sprite traseiro feminino |
| `back_shiny_female` | `string` | Sprite traseiro shiny feminino |

**Tipo: `PokemonCries`**

| Campo | Tipo | Descrição |
|---|---|---|
| `latest` | `string` | URL do grito moderno (.ogg) |
| `legacy` | `string` | URL do grito legado (.ogg) |

**Tipo: `PokemonStat`**

| Campo | Tipo | Descrição |
|---|---|---|
| `stat` | `NamedAPIResource(Stat)` | Atributo (hp, attack, defense, etc.) |
| `effort` | `integer` | EV ganho ao derrotar |
| `base_stat` | `integer` | Valor base do atributo |

---

#### `GET /pokemon/{id or name}/encounters`

Retorna as áreas onde este Pokémon pode ser encontrado.

**Tipo: `LocationAreaEncounter`**

| Campo | Tipo | Descrição |
|---|---|---|
| `location_area` | `NamedAPIResource(LocationArea)` | Área de encontro |
| `version_details` | `list VersionEncounterDetail` | Detalhes por versão |

---

#### `GET /pokemon-species/{id or name}/`

**Tipo: `PokemonSpecies`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome da espécie |
| `order` | `integer` | Ordem de exibição |
| `gender_rate` | `integer` | Chance de ser fêmea em oitavos (-1 = sem gênero) |
| `capture_rate` | `integer` | Taxa de captura base (0–255) |
| `base_happiness` | `integer` | Felicidade ao capturar (0–255) |
| `is_baby` | `boolean` | Se é um Pokémon bebê |
| `is_legendary` | `boolean` | Se é lendário |
| `is_mythical` | `boolean` | Se é mítico |
| `hatch_counter` | `integer` | Contador de eclosão do ovo |
| `has_gender_differences` | `boolean` | Se tem diferenças visuais por gênero |
| `forms_switchable` | `boolean` | Se pode alternar entre formas |
| `growth_rate` | `NamedAPIResource(GrowthRate)` | Taxa de crescimento |
| `pokedex_numbers` | `list PokemonSpeciesDexEntry` | Números em diferentes Pokédexes |
| `egg_groups` | `list NamedAPIResource(EggGroup)` | Grupos de ovo |
| `color` | `NamedAPIResource(PokemonColor)` | Cor principal |
| `shape` | `NamedAPIResource(PokemonShape)` | Forma corporal |
| `evolves_from_species` | `NamedAPIResource(PokemonSpecies)` | Espécie da qual evolui |
| `evolution_chain` | `APIResource(EvolutionChain)` | Cadeia evolutiva |
| `habitat` | `NamedAPIResource(PokemonHabitat)` | Habitat |
| `generation` | `NamedAPIResource(Generation)` | Geração de introdução |
| `names` | `list Name` | Nome em diferentes idiomas |
| `flavor_text_entries` | `list FlavorText` | Texto do Pokédex por versão e idioma |
| `genera` | `list Genus` | Gênero (ex: "Seed Pokémon") por idioma |
| `varieties` | `list PokemonSpeciesVariety` | Variedades (formas) desta espécie |

---

#### `GET /stat/{id or name}/`

Atributos de batalha: `hp`, `attack`, `defense`, `special-attack`, `special-defense`, `speed`.

**Tipo: `Stat`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome do atributo |
| `game_index` | `integer` | Índice interno no jogo |
| `is_battle_only` | `boolean` | Se existe apenas em batalha |
| `affecting_moves` | `MoveStatAffectSets` | Movimentos que alteram este atributo |
| `affecting_natures` | `NatureStatAffectSets` | Naturezas que alteram este atributo |
| `characteristics` | `list APIResource(Characteristic)` | Características relacionadas |
| `move_damage_class` | `NamedAPIResource(MoveDamageClass)` | Classe de dano relacionada |
| `names` | `list Name` | Nome em diferentes idiomas |

---

#### `GET /type/{id or name}/`

**Tipo: `Type`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Nome (ex: `fire`, `water`, `grass`) |
| `damage_relations` | `TypeRelations` | Efetividade contra/a partir de outros tipos |
| `past_damage_relations` | `list TypeRelationsPast` | Relações em gerações anteriores |
| `game_indices` | `list GenerationGameIndex` | Índices por geração |
| `generation` | `NamedAPIResource(Generation)` | Geração de introdução |
| `move_damage_class` | `NamedAPIResource(MoveDamageClass)` | Classe de dano associada |
| `names` | `list Name` | Nome em diferentes idiomas |
| `pokemon` | `list TypePokemon` | Pokémon com este tipo |
| `moves` | `list NamedAPIResource(Move)` | Movimentos deste tipo |

**Tipo: `TypeRelations`**

| Campo | Tipo | Descrição |
|---|---|---|
| `no_damage_to` | `list NamedAPIResource(Type)` | Tipos que este não afeta |
| `half_damage_to` | `list NamedAPIResource(Type)` | Tipos que este afeta com ½x |
| `double_damage_to` | `list NamedAPIResource(Type)` | Tipos que este afeta com 2x |
| `no_damage_from` | `list NamedAPIResource(Type)` | Tipos que não afetam este |
| `half_damage_from` | `list NamedAPIResource(Type)` | Tipos que afetam este com ½x |
| `double_damage_from` | `list NamedAPIResource(Type)` | Tipos que afetam este com 2x |

---

#### Outros endpoints do grupo Pokémon

| Endpoint | Descrição |
|---|---|
| `GET /characteristic/{id}/` | Característica baseada no IV mais alto |
| `GET /egg-group/{id or name}/` | Grupos de compatibilidade para reprodução |
| `GET /gender/{id or name}/` | Gêneros e Pokémon de cada gênero |
| `GET /growth-rate/{id or name}/` | Taxa de ganho de nível por experiência |
| `GET /nature/{id or name}/` | Naturezas e seus efeitos em atributos |
| `GET /pokeathlon-stat/{id or name}/` | Atributos do Pokéathlon |
| `GET /pokemon-color/{id or name}/` | Cores para busca no Pokédex |
| `GET /pokemon-form/{id or name}/` | Formas visuais alternativas |
| `GET /pokemon-habitat/{id or name}/` | Habitats onde Pokémon podem ser encontrados |
| `GET /pokemon-shape/{id or name}/` | Formas corporais para busca no Pokédex |

---

### 4.11 Utility (Utilitários)

#### `GET /language/{id or name}/`

**Tipo: `Language`**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador único |
| `name` | `string` | Código (ex: `en`, `ja`, `fr`, `de`, `pt-br`) |
| `official` | `boolean` | Se os jogos são publicados neste idioma |
| `iso639` | `string` | Código ISO 639 do país |
| `iso3166` | `string` | Código ISO 3166 do idioma |
| `names` | `list Name` | Nome em diferentes idiomas |

---

## 5. Modelos Comuns

Estes tipos são reutilizados em toda a API.

| Tipo | Campos | Descrição |
|---|---|---|
| `APIResource` | `url: string` | Referência a um recurso sem nome |
| `NamedAPIResource` | `name: string`, `url: string` | Referência a um recurso com nome |
| `Name` | `name: string`, `language: NamedAPIResource` | Nome localizado |
| `Description` | `description: string`, `language: NamedAPIResource` | Descrição localizada |
| `Effect` | `effect: string`, `language: NamedAPIResource` | Texto de efeito localizado |
| `VerboseEffect` | `effect: string`, `short_effect: string`, `language: NamedAPIResource` | Efeito completo e resumido |
| `FlavorText` | `flavor_text: string`, `language: NamedAPIResource`, `version: NamedAPIResource` | Texto de sabor por versão |
| `GenerationGameIndex` | `game_index: integer`, `generation: NamedAPIResource` | Índice por geração |
| `VersionGameIndex` | `game_index: integer`, `version: NamedAPIResource` | Índice por versão |
| `MachineVersionDetail` | `machine: APIResource`, `version_group: NamedAPIResource` | Máquina por grupo de versão |
| `VersionGroupFlavorText` | `text: string`, `language: NamedAPIResource`, `version_group: NamedAPIResource` | Texto por grupo de versão |
| `Encounter` | `min_level`, `max_level`, `condition_values`, `chance`, `method` | Detalhes de um encontro |
| `VersionEncounterDetail` | `version`, `max_chance`, `encounter_details` | Encontros por versão |

---

## 6. Guia Prático: Construindo um Portal Completo

---

### 6.1 Estrutura de Projeto Sugerida

```
pokemon-portal/
├── index.html
├── css/
│   ├── reset.css
│   ├── main.css
│   └── responsive.css
├── js/
│   ├── api.js        ← Camada de acesso à API com cache
│   ├── ui.js         ← Funções de renderização
│   ├── router.js     ← Roteamento SPA simples
│   └── main.js       ← Ponto de entrada
└── assets/
    └── type-colors.js
```

---

### 6.2 Configuração Base e Cache

**Cache local com `localStorage`** (fundamental para respeitar a política de uso justo):

```javascript
// js/api.js
const BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_PREFIX = 'pokeapi_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas em ms

async function fetchWithCache(url) {
  const cacheKey = CACHE_PREFIX + url;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data; // Retorna dado em cache
    }
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));

  return data;
}

// Funções de acesso
export const api = {
  getPokemonList: (limit = 20, offset = 0) =>
    fetchWithCache(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`),

  getPokemon: (idOrName) =>
    fetchWithCache(`${BASE_URL}/pokemon/${idOrName}`),

  getPokemonSpecies: (idOrName) =>
    fetchWithCache(`${BASE_URL}/pokemon-species/${idOrName}`),

  getEvolutionChain: (id) =>
    fetchWithCache(`${BASE_URL}/evolution-chain/${id}`),

  getType: (idOrName) =>
    fetchWithCache(`${BASE_URL}/type/${idOrName}`),

  getAbility: (idOrName) =>
    fetchWithCache(`${BASE_URL}/ability/${idOrName}`),

  getMove: (idOrName) =>
    fetchWithCache(`${BASE_URL}/move/${idOrName}`),

  getItem: (idOrName) =>
    fetchWithCache(`${BASE_URL}/item/${idOrName}`),

  getGeneration: (idOrName) =>
    fetchWithCache(`${BASE_URL}/generation/${idOrName}`),
};
```

> **Aviso:** O `localStorage` tem limite de ~5MB. Para portais maiores, considere **IndexedDB** ou um Service Worker como solução de cache.

---

### 6.3 Listagem de Pokémon com Paginação

```javascript
// Buscar todos os 1302 Pokémon de uma vez para busca local
async function loadAllPokemon() {
  const data = await api.getPokemonList(1302, 0);
  return data.results; // [{ name, url }, ...]
}

// Paginação controlada
class PokemonGrid {
  constructor(pageSize = 20) {
    this.pageSize = pageSize;
    this.offset = 0;
    this.total = 0;
  }

  async loadPage() {
    const data = await api.getPokemonList(this.pageSize, this.offset);
    this.total = data.count;

    // Carregar detalhes de cada Pokémon da página em paralelo
    const pokemons = await Promise.all(
      data.results.map(p => api.getPokemon(p.name))
    );

    return pokemons;
  }

  nextPage() { this.offset += this.pageSize; }
  prevPage() { this.offset = Math.max(0, this.offset - this.pageSize); }
  get currentPage() { return Math.floor(this.offset / this.pageSize) + 1; }
  get totalPages() { return Math.ceil(this.total / this.pageSize); }
}
```

---

### 6.4 Detalhes de um Pokémon

```javascript
// Montar objeto completo com dados combinados de múltiplos endpoints
async function getPokemonDetails(nameOrId) {
  // Chamadas em paralelo para maior performance
  const [pokemon, species] = await Promise.all([
    api.getPokemon(nameOrId),
    api.getPokemonSpecies(nameOrId),
  ]);

  // ID da cadeia evolutiva a partir da URL
  const evoChainId = species.evolution_chain.url.split('/').at(-2);
  const evolutionChain = await api.getEvolutionChain(evoChainId);

  // Pegar o flavor text em português (pt-br) ou inglês
  const flavorText = species.flavor_text_entries
    .find(e => e.language.name === 'pt-br')
    ?.flavor_text
    .replace(/\f/g, ' ')   // Remover quebras de página
    .replace(/\n/g, ' ')   // Remover quebras de linha
    ?? species.flavor_text_entries
      .find(e => e.language.name === 'en')?.flavor_text ?? '';

  // Formatar altura e peso
  const height = `${(pokemon.height / 10).toFixed(1)} m`;
  const weight = `${(pokemon.weight / 10).toFixed(1)} kg`;

  // Atributos base formatados
  const stats = pokemon.stats.map(s => ({
    name: s.stat.name,
    value: s.base_stat,
    effort: s.effort,
  }));

  return {
    id: pokemon.id,
    name: pokemon.name,
    height,
    weight,
    types: pokemon.types.map(t => t.type.name),
    abilities: pokemon.abilities.map(a => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    })),
    stats,
    sprites: pokemon.sprites,
    cries: pokemon.cries,
    flavorText,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    captureRate: species.capture_rate,
    baseHappiness: species.base_happiness,
    eggGroups: species.egg_groups.map(e => e.name),
    evolutionChain,
    genus: species.genera.find(g => g.language.name === 'en')?.genus ?? '',
  };
}
```

---

### 6.5 Exibindo Sprites e Imagens

```javascript
// URLs de sprite por formato e geração
function getSpriteUrls(pokemon) {
  const id = String(pokemon.id).padStart(3, '0');

  return {
    // Sprites oficiais da API
    frontDefault:  pokemon.sprites.front_default,
    frontShiny:    pokemon.sprites.front_shiny,
    backDefault:   pokemon.sprites.back_default,
    backShiny:     pokemon.sprites.back_shiny,

    // Artwork oficial de alta resolução (não está no objeto sprites)
    officialArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
    officialArtworkShiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`,

    // Home renders 3D
    home: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`,

    // Pixel art de gerações específicas
    gen1Red:  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/${pokemon.id}.png`,
    gen2Gold: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/${pokemon.id}.png`,
  };
}

// Tratar sprites nulos
function getSafeSpriteUrl(pokemon, fallbackId) {
  return pokemon.sprites.front_default
    ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${fallbackId}.png`;
}

// Tocar o grito do Pokémon
function playCry(cries, useLatest = true) {
  const url = useLatest ? cries.latest : cries.legacy;
  if (!url) return;
  const audio = new Audio(url);
  audio.volume = 0.5;
  audio.play().catch(() => {}); // Ignorar erros de autoplay
}
```

---

### 6.6 Cadeia Evolutiva

```javascript
// Converter a estrutura de árvore do ChainLink em array flat
function parseEvolutionChain(chain) {
  const result = [];

  function traverse(link) {
    result.push({
      species: link.species.name,
      speciesUrl: link.species.url,
      isBaby: link.is_baby,
      evolutionDetails: link.evolution_details.map(d => ({
        trigger: d.trigger?.name,
        minLevel: d.min_level,
        item: d.item?.name,
        heldItem: d.held_item?.name,
        timeOfDay: d.time_of_day,
        minHappiness: d.min_happiness,
        location: d.location?.name,
        knownMove: d.known_move?.name,
        gender: d.gender,
        needsRain: d.needs_overworld_rain,
        turnUpsideDown: d.turn_upside_down,
      })),
    });

    link.evolves_to.forEach(traverse);
  }

  traverse(chain);
  return result;
}

// Extrair o ID de espécie a partir de uma URL
function extractIdFromUrl(url) {
  return parseInt(url.split('/').at(-2));
}
```

---

### 6.7 Busca e Filtros

```javascript
// Busca local (após carregar toda a lista)
class PokemonSearch {
  constructor(allPokemon) {
    this.all = allPokemon; // [{ name, url }]
  }

  // Busca por nome
  searchByName(query) {
    const q = query.toLowerCase().trim();
    return this.all.filter(p => p.name.includes(q));
  }

  // Busca por ID (National Dex)
  searchById(id) {
    return this.all.filter(p => {
      const pkId = extractIdFromUrl(p.url);
      return pkId === parseInt(id);
    });
  }

  // Filtrar por tipo
  async filterByType(typeName) {
    const typeData = await api.getType(typeName);
    const names = new Set(typeData.pokemon.map(p => p.pokemon.name));
    return this.all.filter(p => names.has(p.name));
  }

  // Filtrar por geração
  async filterByGeneration(genName) {
    const genData = await api.getGeneration(genName);
    const names = new Set(genData.pokemon_species.map(s => s.name));
    return this.all.filter(p => names.has(p.name));
  }
}

// Cores dos tipos para a UI
export const TYPE_COLORS = {
  normal:   '#A8A878', fire:     '#F08030', water:    '#6890F0',
  electric: '#F8D030', grass:    '#78C850', ice:      '#98D8D8',
  fighting: '#C03028', poison:   '#A040A0', ground:   '#E0C068',
  flying:   '#A890F0', psychic:  '#F85888', bug:      '#A8B820',
  rock:     '#B8A038', ghost:    '#705898', dragon:   '#7038F8',
  dark:     '#705848', steel:    '#B8B8D0', fairy:    '#EE99AC',
};
```

---

### 6.8 Design Responsivo — Boas Práticas

#### CSS Grid para o Card de Pokédex

```css
/* Grid responsivo sem media queries */
.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.pokemon-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pokemon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.pokemon-card img {
  width: 100%;
  max-width: 120px;
  image-rendering: pixelated; /* Para sprites pixel-art */
  image-rendering: crisp-edges;
}
```

#### Layout de Detalhes Responsivo

```css
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* Tablet */
@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr; }
  .pokemon-grid  { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
}

/* Mobile */
@media (max-width: 480px) {
  .pokemon-grid  { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
}
```

#### Barra de Atributos (Stats)

```css
.stat-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.stat-bar__label { width: 120px; font-size: 0.85rem; text-align: right; }
.stat-bar__value { width: 40px; font-weight: 700; }

.stat-bar__fill {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.stat-bar__fill-inner {
  height: 100%;
  border-radius: 4px;
  /* width é definido dinamicamente: (base_stat / 255 * 100)% */
  transition: width 0.6s ease;
  background: linear-gradient(90deg, #78c850, #f08030);
}
```

#### Badge de Tipo

```css
.type-badge {
  display: inline-block;
  padding: 0.2em 0.75em;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: white;
  /* background é definido via JS com TYPE_COLORS[typeName] */
}
```

#### Lazy Loading de Imagens

```javascript
// Usar IntersectionObserver para carregar sprites apenas quando visíveis
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
}, { rootMargin: '100px' });

document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
```

---

## 7. Bibliotecas Wrapper

Use uma das bibliotecas abaixo para evitar escrever a camada de fetch do zero:

| Linguagem | Biblioteca | Cache automático |
|---|---|---|
| Node.js (server) | [Pokedex Promise v2](https://github.com/PokeAPI/pokedex-promise-v2) | ✅ |
| Browser (JS) | [pokeapi-js-wrapper](https://github.com/PokeAPI/pokeapi-js-wrapper) | ✅ |
| TypeScript | [Pokenode-ts](https://github.com/Gabb-c/pokenode-ts) | ✅ |
| Python 3 | [PokeBase](https://github.com/GregHilmes/pokebase) | ✅ |
| Python 2/3 | [Pokepy](https://github.com/phalt/pokepy) | ✅ |
| Rust | [Rustemon](https://github.com/mlemesle/rustemon) | ✅ |
| Go | [pokeapi-go](https://github.com/mtslzr/pokeapi-go) | ❌ |
| Swift | [PokemonAPI](https://github.com/kinkofer/PokemonAPI) | ❌ |
| .NET (C#) | [PokeApiNet](https://github.com/mtrdp642/PokeApiNet) | ❌ |
| PHP | [PokePHP](https://github.com/danrovito/pokephp) | ❌ |
| Ruby | [Poke-Api-V2](https://github.com/rdavid1099/poke-api-v2) | ❌ |
| Kotlin | [PokeKotlin](https://github.com/PokeAPI/pokekotlin) | ✅ |
| Elixir | [Max-Elixir-PokeAPI](https://github.com/HenriqueArtur/Max-Elixir-PokeAPI) | ✅ |
| Scala 3 | [pokeapi-scala](https://github.com/juliano/pokeapi-scala) | ✅ |

---

## 8. Referência Rápida de Endpoints

| Grupo | Endpoint | Parâmetro |
|---|---|---|
| **Berries** | `/berry/` | `{id or name}` |
| | `/berry-firmness/` | `{id or name}` |
| | `/berry-flavor/` | `{id or name}` |
| **Contests** | `/contest-type/` | `{id or name}` |
| | `/contest-effect/` | `{id}` |
| | `/super-contest-effect/` | `{id}` |
| **Encounters** | `/encounter-method/` | `{id or name}` |
| | `/encounter-condition/` | `{id or name}` |
| | `/encounter-condition-value/` | `{id or name}` |
| **Evolution** | `/evolution-chain/` | `{id}` |
| | `/evolution-trigger/` | `{id or name}` |
| **Games** | `/generation/` | `{id or name}` |
| | `/pokedex/` | `{id or name}` |
| | `/version/` | `{id or name}` |
| | `/version-group/` | `{id or name}` |
| **Items** | `/item/` | `{id or name}` |
| | `/item-attribute/` | `{id or name}` |
| | `/item-category/` | `{id or name}` |
| | `/item-fling-effect/` | `{id or name}` |
| | `/item-pocket/` | `{id or name}` |
| **Locations** | `/location/` | `{id or name}` |
| | `/location-area/` | `{id or name}` |
| | `/pal-park-area/` | `{id or name}` |
| | `/region/` | `{id or name}` |
| **Machines** | `/machine/` | `{id}` |
| **Moves** | `/move/` | `{id or name}` |
| | `/move-ailment/` | `{id or name}` |
| | `/move-battle-style/` | `{id or name}` |
| | `/move-category/` | `{id or name}` |
| | `/move-damage-class/` | `{id or name}` |
| | `/move-learn-method/` | `{id or name}` |
| | `/move-target/` | `{id or name}` |
| **Pokémon** | `/ability/` | `{id or name}` |
| | `/characteristic/` | `{id}` |
| | `/egg-group/` | `{id or name}` |
| | `/gender/` | `{id or name}` |
| | `/growth-rate/` | `{id or name}` |
| | `/nature/` | `{id or name}` |
| | `/pokeathlon-stat/` | `{id or name}` |
| | `/pokemon/` | `{id or name}` |
| | `/pokemon/{id}/encounters` | — |
| | `/pokemon-color/` | `{id or name}` |
| | `/pokemon-form/` | `{id or name}` |
| | `/pokemon-habitat/` | `{id or name}` |
| | `/pokemon-shape/` | `{id or name}` |
| | `/pokemon-species/` | `{id or name}` |
| | `/stat/` | `{id or name}` |
| | `/type/` | `{id or name}` |
| **Utility** | `/language/` | `{id or name}` |

---

*Documentação baseada na PokéAPI v2 — [pokeapi.co](https://pokeapi.co)*
*Pokémon e nomes de personagens Pokémon são marcas registradas da Nintendo.*