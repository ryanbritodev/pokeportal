import {
  useState, useEffect, useMemo, useCallback, useRef,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListEntry { name: string; url: string; }

interface PokeType     { slot: number; type: { name: string; url: string }; }
interface PokeStat     { base_stat: number; effort: number; stat: { name: string; url: string }; }
interface PokeAbility  { is_hidden: boolean; slot: number; ability: { name: string; url: string }; }
interface PokeMoveVGD  { level_learned_at: number; move_learn_method: { name: string }; version_group: { name: string }; }
interface PokeMove     { move: { name: string; url: string }; version_group_details: PokeMoveVGD[]; }

interface PokemonData {
  id: number; name: string;
  base_experience: number | null;
  height: number; weight: number;
  abilities: PokeAbility[];
  moves: PokeMove[];
  stats: PokeStat[];
  types: PokeType[];
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other?: {
      "official-artwork": { front_default: string; front_shiny?: string };
      showdown?: { front_default?: string; front_shiny?: string };
    };
  };
  cries: { latest: string; legacy: string };
  species: { name: string; url: string };
}

interface SpeciesData {
  id: number; name: string;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean; is_legendary: boolean; is_mythical: boolean;
  hatch_counter: number;
  growth_rate: { name: string };
  egg_groups: { name: string }[];
  color: { name: string };
  evolution_chain: { url: string };
  generation: { name: string };
  flavor_text_entries: { flavor_text: string; language: { name: string }; version: { name: string } }[];
  genera: { genus: string; language: { name: string } }[];
}

interface ChainNode {
  species: { name: string; url: string };
  evolution_details: {
    min_level?: number; item?: { name: string }; trigger?: { name: string };
    held_item?: { name: string }; known_move?: { name: string };
    min_happiness?: number; time_of_day?: string;
  }[];
  evolves_to: ChainNode[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A", fire: "#EE8130", water: "#6390F0",
  electric: "#F7D02C", grass: "#7AC74C", ice: "#96D9D6",
  fighting: "#C22E28", poison: "#A33EA1", ground: "#E2BF65",
  flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
  rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC",
  dark: "#705746", steel: "#B7B7CE", fairy: "#D685AD",
};

const GENERATIONS = [
  { id: 0, label: "All",      region: "All",    offset: 0,   count: 1025 },
  { id: 1, label: "Gen I",    region: "Kanto",  offset: 0,   count: 151  },
  { id: 2, label: "Gen II",   region: "Johto",  offset: 151, count: 100  },
  { id: 3, label: "Gen III",  region: "Hoenn",  offset: 251, count: 135  },
  { id: 4, label: "Gen IV",   region: "Sinnoh", offset: 386, count: 107  },
  { id: 5, label: "Gen V",    region: "Unova",  offset: 493, count: 156  },
  { id: 6, label: "Gen VI",   region: "Kalos",  offset: 649, count: 72   },
  { id: 7, label: "Gen VII",  region: "Alola",  offset: 721, count: 88   },
  { id: 8, label: "Gen VIII", region: "Galar",  offset: 809, count: 96   },
  { id: 9, label: "Gen IX",   region: "Paldea", offset: 905, count: 120  },
];

const STAT_META: Record<string, { abbr: string; color: string }> = {
  hp:               { abbr: "HP",  color: "#ff5959" },
  attack:           { abbr: "ATK", color: "#f5ac78" },
  defense:          { abbr: "DEF", color: "#fae078" },
  "special-attack": { abbr: "SPA", color: "#9db7f5" },
  "special-defense":{ abbr: "SPD", color: "#a7db8d" },
  speed:            { abbr: "SPE", color: "#fa92b2" },
};

const SORT_OPTIONS = [
  { value: "id",    label: "ID"    },
  { value: "name",  label: "Name"   },
  { value: "total", label: "Total"  },
  { value: "hp",    label: "HP"     },
  { value: "atk",   label: "Attack" },
  { value: "spe",   label: "Speed"  },
];

// Baked-in type effectiveness chart (avoids extra API calls)
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal:   { rock:.5, ghost:0, steel:.5 },
  fire:     { fire:.5, water:.5, rock:.5, dragon:.5, grass:2, ice:2, bug:2, steel:2 },
  water:    { water:.5, grass:.5, dragon:.5, fire:2, ground:2, rock:2 },
  electric: { electric:.5, grass:.5, dragon:.5, ground:0, water:2, flying:2 },
  grass:    { fire:.5, grass:.5, poison:.5, flying:.5, bug:.5, dragon:.5, steel:.5, water:2, ground:2, rock:2 },
  ice:      { water:.5, ice:.5, grass:2, ground:2, flying:2, dragon:2 },
  fighting: { poison:.5, bug:.5, psychic:.5, flying:.5, fairy:.5, ghost:0, normal:2, ice:2, rock:2, dark:2, steel:2 },
  poison:   { poison:.5, ground:.5, rock:.5, ghost:.5, fairy:2, grass:2, steel:0 },
  ground:   { grass:.5, bug:.5, flying:0, fire:2, electric:2, poison:2, rock:2, steel:2 },
  flying:   { electric:.5, rock:.5, steel:.5, grass:2, fighting:2, bug:2 },
  psychic:  { psychic:.5, steel:.5, dark:0, fighting:2, poison:2 },
  bug:      { fire:.5, fighting:.5, flying:.5, ghost:.5, steel:.5, fairy:.5, grass:2, psychic:2, dark:2 },
  rock:     { fighting:.5, ground:.5, steel:.5, fire:2, ice:2, flying:2, bug:2 },
  ghost:    { normal:0, dark:.5, ghost:2, psychic:2 },
  dragon:   { steel:.5, dragon:2, fairy:0, ice:2 },
  dark:     { fighting:.5, dark:.5, fairy:.5, ghost:2, psychic:2 },
  steel:    { fire:.5, water:.5, electric:.5, steel:.5, ice:2, rock:2, fairy:2 },
  fairy:    { fire:.5, poison:.5, steel:.5, dragon:2, dark:2, fighting:2 },
};

const ALL_TYPES = Object.keys(TYPE_COLORS);
const PAGE_SIZE = 100;
const FAVS_KEY  = "pokeportal_favs";

// ─── Sprite URL helpers ───────────────────────────────────────────────────────

const artworkUrl  = (id: number, shiny = false) =>
  shiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const showdownGif = (id: number, shiny = false) =>
  shiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;

const genVGif     = (id: number, shiny = false) =>
  shiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${id}.gif`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

// ─── API Cache + Fetch ────────────────────────────────────────────────────────

const CACHE: Record<string, unknown> = {};

async function apiFetch<T>(url: string): Promise<T> {
  if (CACHE[url]) return CACHE[url] as T;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  CACHE[url] = data;
  return data as T;
}

const fetchPokemon  = (q: string | number) => apiFetch<PokemonData>(`https://pokeapi.co/api/v2/pokemon/${q}`);
const fetchSpecies  = (q: string | number) => apiFetch<SpeciesData>(`https://pokeapi.co/api/v2/pokemon-species/${q}`);
const fetchEvoChain = (url: string) => apiFetch<{ id: number; chain: ChainNode }>(url);
const fetchGenList  = (offset: number, count: number) =>
  apiFetch<{ results: ListEntry[] }>(`https://pokeapi.co/api/v2/pokemon?limit=${count}&offset=${offset}`);

const getIdFromUrl = (url: string) =>
  parseInt(url.split("/").filter(Boolean).pop()!, 10);

const parseChain = (chain: ChainNode) => {
  const stages: { name: string; details: ChainNode["evolution_details"][0] | null }[][] = [];
  const walk = (node: ChainNode, d: number) => {
    if (!stages[d]) stages[d] = [];
    stages[d].push({ name: node.species.name, details: node.evolution_details[0] ?? null });
    node.evolves_to.forEach((n) => walk(n, d + 1));
  };
  walk(chain, 0);
  return stages;
};

// ─── Favorites (localStorage) ─────────────────────────────────────────────────

const loadFavs = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(FAVS_KEY) ?? "[]")); }
  catch { return new Set(); }
};
const saveFavs = (f: Set<string>) =>
  localStorage.setItem(FAVS_KEY, JSON.stringify([...f]));

// ─── Animated Sprite with fallback chain ─────────────────────────────────────

// key={`${id}-${shiny}`} must be set by the caller so React remounts
// this component (resetting fallback to 0) whenever id or shiny changes.
const AnimSprite = ({
  id, shiny = false, className, alt, style,
}: {
  id: number; shiny?: boolean; className?: string;
  alt?: string; style?: React.CSSProperties;
}) => {
  const [fallback, setFallback] = useState(0);

  const src =
    fallback === 0 ? showdownGif(id, shiny) :
    fallback === 1 ? genVGif(id, shiny) :
                     artworkUrl(id, shiny);

  return (
    <img
      src={src} alt={alt ?? ""} className={className}
      style={style} loading="lazy"
      onError={() => setFallback((f) => Math.min(f + 1, 2))}
    />
  );
};

// ─── Type Badge ───────────────────────────────────────────────────────────────

const TypeBadge = ({ type, size = "sm" }: { type: string; size?: "sm" | "md" }) => (
  <span className={`type-badge type-badge--${size}`} style={{ background: TYPE_COLORS[type] }}>
    {type}
  </span>
);

// ─── Stat Bar ─────────────────────────────────────────────────────────────────

const StatBar = ({ name, value }: { name: string; value: number }) => {
  const meta = STAT_META[name] ?? { abbr: name.slice(0, 3).toUpperCase(), color: "#888" };
  const pct  = Math.min(100, Math.round((value / 255) * 100));
  return (
    <div className="stat-row">
      <span className="stat-abbr">{meta.abbr}</span>
      <span className="stat-val">{value}</span>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${pct}%`, background: meta.color }} />
      </div>
    </div>
  );
};

// ─── Type Effectiveness Chart ─────────────────────────────────────────────────

const TypeChart = ({ types }: { types: string[] }) => {
  const groups = useMemo(() => {
    const map: Record<string, number> = {};
    ALL_TYPES.forEach((at) => {
      const mult = types.reduce((acc, dt) => acc * ((TYPE_CHART[at] ?? {})[dt] ?? 1), 1);
      if (mult !== 1) map[at] = mult;
    });
    return {
      "4×":  Object.entries(map).filter(([, m]) => m === 4),
      "2×":  Object.entries(map).filter(([, m]) => m === 2),
      "½×":  Object.entries(map).filter(([, m]) => m === 0.5),
      "¼×":  Object.entries(map).filter(([, m]) => m === 0.25),
      "0×":  Object.entries(map).filter(([, m]) => m === 0),
    };
  }, [types]);

  const colors: Record<string, string> = {
    "4×": "#ff4040", "2×": "#f5ac78", "½×": "#7AC74C", "¼×": "#29a329", "0×": "#aaa",
  };

  const anyEntry = Object.values(groups).some((g) => g.length > 0);

  return (
    <div className="type-chart">
      {(["4×", "2×", "½×", "¼×", "0×"] as const).map((k) =>
        groups[k].length > 0 ? (
          <div key={k} className="tc-row">
            <span className="tc-label" style={{ color: colors[k] }}>{k}</span>
            <div className="tc-pills">
              {groups[k].map(([t]) => <TypeBadge key={t} type={t} size="sm" />)}
            </div>
          </div>
        ) : null
      )}
      {!anyEntry && <p className="no-data">No notable resistances or weaknesses.</p>}
    </div>
  );
};

// ─── Evolution Chain View ─────────────────────────────────────────────────────

type EvoStages = ReturnType<typeof parseChain>;

const EvoChainView = ({
  stages, currentName, evoData, onSelect,
}: {
  stages: EvoStages;
  currentName: string;
  evoData: Record<string, PokemonData>;
  onSelect: (n: string) => void;
}) => (
  <div className="evo-chain">
    {stages.map((stage, si) => (
      <div key={si} className="evo-stage">
        {si > 0 && (
          <div className="evo-arrow">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11h14M12 5l6 6-6 6"
                stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {stage[0]?.details && (
              <span className="evo-trigger">
                {stage[0].details.min_level
                  ? `Lv.${stage[0].details.min_level}`
                  : stage[0].details.item
                  ? stage[0].details.item.name.replace(/-/g, " ")
                  : stage[0].details.held_item
                  ? `Hold: ${stage[0].details.held_item.name.replace(/-/g, " ")}`
                  : stage[0].details.min_happiness
                  ? `Hap.${stage[0].details.min_happiness}`
                  : stage[0].details.time_of_day
                  ? stage[0].details.time_of_day
                  : stage[0].details.trigger?.name.replace(/-/g, " ") ?? ""}
              </span>
            )}
          </div>
        )}
        <div className="evo-nodes">
          {stage.map((node) => {
            const pd     = evoData[node.name];
            const active = node.name === currentName;
            return (
              <div
                key={node.name}
                className={`evo-node${active ? " evo-node--active" : ""}`}
                onClick={() => !active && onSelect(node.name)}
              >
                {pd
                  ? <AnimSprite key={`${pd.id}-false`} id={pd.id} className="evo-img" alt={node.name} />
                  : <div className="evo-ghost" />}
                <span className="evo-label">{node.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

// ─── Detail Modal ─────────────────────────────────────────────────────────────

// ─── Shared state shapes (defined outside components to avoid exhaustive-deps warnings) ─

type ModalState = {
  pData: PokemonData | null; sData: SpeciesData | null;
  stages: EvoStages | null; evoData: Record<string, PokemonData>;
  loading: boolean; tab: "stats" | "moves" | "weaknesses" | "evolution"; shiny: boolean;
};
const MODAL_INIT: ModalState = {
  pData: null, sData: null, stages: null, evoData: {},
  loading: true, tab: "stats", shiny: false,
};

type GenState = {
  initialLoad: boolean; allList: ListEntry[];
  pokemonData: Record<string, PokemonData>;
  loadedPct: number; displayCount: number;
  search: string; typeFilter: string;
};
const GEN_INIT: GenState = {
  initialLoad: true, allList: [], pokemonData: {},
  loadedPct: 0, displayCount: PAGE_SIZE, search: "", typeFilter: "all",
};

type MoveMethod = "level" | "tm" | "egg";

const Modal = ({
  name, onClose, onNavigate,
}: {
  name: string; onClose: () => void; onNavigate: (n: string) => void;
}) => {
  const [md, setMd] = useState<ModalState>(MODAL_INIT);
  const [moveTab, setMoveTab] = useState<MoveMethod>("level");
  // Convenience destructuring
  const { pData, sData, stages, evoData, loading, tab, shiny } = md;
  const setTab   = (t: ModalState["tab"]) => setMd(p => ({ ...p, tab: t }));
  const setShiny = (v: boolean | ((b: boolean) => boolean)) =>
    setMd(p => ({ ...p, shiny: typeof v === "function" ? v(p.shiny) : v }));

  useEffect(() => {
    if (!name) return;

    (async () => {
      setMd(MODAL_INIT); // inside IIFE — not a top-level synchronous setState
      try {
        const [p, s] = await Promise.all([fetchPokemon(name), fetchSpecies(name)]);
        setMd(prev => ({ ...prev, pData: p, sData: s }));
        const ec = await fetchEvoChain(s.evolution_chain.url);
        const st = parseChain(ec.chain);
        setMd(prev => ({ ...prev, stages: st }));
        const allNames = st.flat().map((n) => n.name);
        const results  = await Promise.allSettled(allNames.map((n) => fetchPokemon(n)));
        const map: Record<string, PokemonData> = {};
        results.forEach((r) => { if (r.status === "fulfilled") map[r.value.name] = r.value; });
        setMd(prev => ({ ...prev, evoData: map, loading: false }));
      } catch (e) {
        console.error(e);
        setMd(prev => ({ ...prev, loading: false }));
      }
    })();
  }, [name]);

  const playCry = () => {
    const url = pData?.cries?.latest ?? pData?.cries?.legacy;
    if (url) new Audio(url).play().catch(() => {});
  };

  const primaryType = pData?.types[0]?.type.name;
  const accent      = primaryType ? TYPE_COLORS[primaryType] : "#6390F0";
  const flavorText  = sData?.flavor_text_entries
    .find((e) => e.language.name === "en")
    ?.flavor_text.replace(/\f|\n/g, " ") ?? "";
  const genus = sData?.genera.find((g) => g.language.name === "en")?.genus ?? "";
  const totalStats = pData?.stats.reduce((s, x) => s + x.base_stat, 0) ?? 0;
  const genderRate = sData?.gender_rate ?? -1;
  const femChance  = genderRate === -1 ? null : Math.round((genderRate / 8) * 100);

  const movesFor = (method: string) =>
    (pData?.moves ?? [])
      .filter((m) => m.version_group_details.some((v) => v.move_learn_method.name === method))
      .sort((a, b) => {
        const la = a.version_group_details.find(v => v.move_learn_method.name === method)?.level_learned_at ?? 0;
        const lb = b.version_group_details.find(v => v.move_learn_method.name === method)?.level_learned_at ?? 0;
        return la - lb;
      });

  const levelMoves = movesFor("level-up");
  const tmMoves    = movesFor("machine");
  const eggMoves   = movesFor("egg");

  const defTypes   = pData?.types.map((t) => t.type.name) ?? [];

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal"
        style={{ "--accent": accent, "--accent-bg": accent + "18" } as React.CSSProperties}
      >
        <button className="modal-close" onClick={onClose}>✕</button>

        {loading ? (
          <div className="modal-loading">
            <div className="pokeball-spin">
              <div className="pb-top"/><div className="pb-mid"/><div className="pb-btn"/>
            </div>
            <span>Loading Pokémon data…</span>
          </div>
        ) : pData && sData && (
          <>
            {/* ── Hero ── */}
            <div
              className="modal-hero"
              style={{ background: `linear-gradient(135deg, ${accent}1a 0%, transparent 70%)` }}
            >
              <div className="modal-sprite-wrap">
                <div className="sprite-glow" style={{ background: accent }} />
                <AnimSprite
                  key={`${pData.id}-${shiny}`}
                  id={pData.id} shiny={shiny}
                  className="modal-sprite" alt={pData.name}
                />
                <div className="sprite-controls">
                  <button
                    className={`ctrl-btn${shiny ? " ctrl-btn--active" : ""}`}
                    onClick={() => setShiny(v => !v)}
                    title="Toggle Shiny"
                  >✨ Shiny</button>
                  <button className="ctrl-btn" onClick={playCry} title="Play Sound">
                    🔊 Sound
                  </button>
                </div>
              </div>

              <div className="modal-meta">
                <div className="modal-num">#{String(pData.id).padStart(4, "0")}</div>
                <h2 className="modal-name">{pData.name}</h2>
                {genus && <div className="modal-genus">{genus}</div>}

                <div className="modal-types">
                  {pData.types.map((t) => (
                    <TypeBadge key={t.type.name} type={t.type.name} size="md" />
                  ))}
                </div>

                <div className="phys-grid">
                  <div className="phys-cell"><span className="phys-label">Height</span><span className="phys-val">{(pData.height/10).toFixed(1)}m</span></div>
                  <div className="phys-cell"><span className="phys-label">Weight</span><span className="phys-val">{(pData.weight/10).toFixed(1)}kg</span></div>
                  <div className="phys-cell"><span className="phys-label">Base EXP</span><span className="phys-val">{pData.base_experience ?? "—"}</span></div>
                  <div className="phys-cell"><span className="phys-label">Total</span><span className="phys-val" style={{ color: accent }}>{totalStats}</span></div>
                  <div className="phys-cell"><span className="phys-label">Catch Rate</span><span className="phys-val">{sData.capture_rate}</span></div>
                  <div className="phys-cell"><span className="phys-label">Growth</span><span className="phys-val">{sData.growth_rate.name.replace(/-/g," ")}</span></div>
                  <div className="phys-cell"><span className="phys-label">Gender</span><span className="phys-val">{genderRate === -1 ? "Genderless" : `${100-(femChance??0)}%♂ ${femChance??0}%♀`}</span></div>
                  <div className="phys-cell"><span className="phys-label">Egg Groups</span><span className="phys-val">{sData.egg_groups.map(e=>e.name).join(", ")}</span></div>
                </div>

                <div className="badges-row">
                  {sData.is_baby      && <span className="lore-badge lore-badge--baby">Baby</span>}
                  {sData.is_legendary && <span className="lore-badge lore-badge--legend">Legendary</span>}
                  {sData.is_mythical  && <span className="lore-badge lore-badge--myth">Mythical</span>}
                </div>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="tabs">
              {(["stats", "moves", "weaknesses", "evolution"] as const).map((t) => (
                <button
                  key={t}
                  className={`tab${tab === t ? " tab--active" : ""}`}
                  style={tab === t ? { color: accent, borderColor: accent } : {}}
                  onClick={() => setTab(t)}
                >{t}</button>
              ))}
            </div>

            <div className="modal-body">
              {flavorText && <p className="flavor">{flavorText}</p>}

              {/* Stats */}
              {tab === "stats" && (
                <>
                  <div className="section-hd">Base Stats</div>
                  {pData.stats.map((s) => (
                    <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />
                  ))}
                  <div className="section-hd" style={{ marginTop: "1.5rem" }}>Abilities</div>
                  <div className="abilities">
                    {pData.abilities.map((a) => (
                      <div key={a.ability.name} className={`ability${a.is_hidden ? " ability--hidden" : ""}`}>
                        <span className="ability-name">{a.ability.name.replace(/-/g, " ")}</span>
                        {a.is_hidden && <span className="ability-tag">Hidden</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Moves */}
              {tab === "moves" && (
                <>
                  <div className="move-tabs">
                    {([
                      ["level", `Level-Up (${levelMoves.length})`],
                      ["tm",    `TM/HM (${tmMoves.length})`],
                      ["egg",   `Egg (${eggMoves.length})`],
                    ] as [MoveMethod, string][]).map(([k, lbl]) => (
                      <button
                        key={k}
                        className={`move-tab${moveTab === k ? " move-tab--active" : ""}`}
                        style={moveTab === k ? { color: accent, borderColor: accent } : {}}
                        onClick={() => setMoveTab(k)}
                      >{lbl}</button>
                    ))}
                  </div>
                  <div className="moves-grid">
                    {(moveTab === "level" ? levelMoves : moveTab === "tm" ? tmMoves : eggMoves).map((m) => {
                      const methodName = moveTab === "level" ? "level-up" : moveTab === "tm" ? "machine" : "egg";
                      const vgd = m.version_group_details.find(v => v.move_learn_method.name === methodName);
                      return (
                        <div key={m.move.name} className="move-item">
                          {moveTab === "level" && (
                            <span className="move-lv">Lv.{vgd?.level_learned_at ?? "—"}</span>
                          )}
                          <span className="move-name">{m.move.name.replace(/-/g, " ")}</span>
                        </div>
                      );
                    })}
                    {(moveTab === "level" ? levelMoves : moveTab === "tm" ? tmMoves : eggMoves).length === 0 && (
                      <p className="no-data">No {moveTab} moves found.</p>
                    )}
                  </div>
                </>
              )}

              {/* Weaknesses */}
              {tab === "weaknesses" && (
                <>
                  <div className="section-hd">Type Effectiveness (attacking this Pokémon)</div>
                  <TypeChart types={defTypes} />
                </>
              )}

              {/* Evolution */}
              {tab === "evolution" && stages && (
                <>
                  <div className="section-hd">Evolution Chain</div>
                  {stages.length <= 1
                    ? <p className="no-data">This Pokémon does not evolve.</p>
                    : <EvoChainView
                        stages={stages} currentName={pData.name}
                        evoData={evoData} onSelect={onNavigate}
                      />}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Pokémon Card ─────────────────────────────────────────────────────────────

const PokemonCard = ({
  entry, data, onClick, isFav, onFavToggle,
}: {
  entry: ListEntry; data: PokemonData | undefined;
  onClick: (n: string) => void;
  isFav: boolean; onFavToggle: (n: string) => void;
}) => {
  const id          = getIdFromUrl(entry.url);
  const primaryType = data?.types[0]?.type.name;
  const accent      = primaryType ? TYPE_COLORS[primaryType] : "#6390F0";

  return (
    <div
      className="card"
      style={{ "--card-accent": accent } as React.CSSProperties}
      onClick={() => onClick(entry.name)}
    >
      <div className="card-shine" />
      <button
        className={`fav-btn${isFav ? " fav-btn--active" : ""}`}
        onClick={(e) => { e.stopPropagation(); onFavToggle(entry.name); }}
        title={isFav ? "Remove favourite" : "Add favourite"}
      >♥</button>
      <span className="card-id">#{String(id).padStart(4, "0")}</span>

      {data
        ? <AnimSprite key={`${data.id}-false`} id={data.id} className="card-sprite" alt={data.name} />
        : <div className="card-ghost" />}

      <span className="card-name">{entry.name}</span>
      <div className="card-types">
        {data
          ? data.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} />)
          : <div className="type-badge-ghost" />}
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function PokePortal() {
  const [genId,     setGenId]     = useState(0);
  const [sortBy,    setSortBy]    = useState("id");
  const [modalName, setModalName] = useState<string | null>(null);
  const [favs,      setFavs]      = useState<Set<string>>(loadFavs);
  const [favsOnly,  setFavsOnly]  = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const [gs, setGs] = useState<GenState>(GEN_INIT);
  // Convenience destructuring
  const { initialLoad, allList, pokemonData, loadedPct, displayCount, search, typeFilter } = gs;
  const setSearch      = (v: string)  => { setGs(p => ({ ...p, search: v, displayCount: PAGE_SIZE })); };
  const setTypeFilter  = (v: string)  => { setGs(p => ({ ...p, typeFilter: v, displayCount: PAGE_SIZE })); };
  const setDisplayCount= (fn: ((c: number) => number) | number) =>
    setGs(p => ({ ...p, displayCount: typeof fn === "function" ? fn(p.displayCount) : fn }));

  // Load generation
  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const gen = GENERATIONS.find((g) => g.id === genId)!;

    (async () => {
      setGs(GEN_INIT); // inside IIFE — not a top-level synchronous setState
      try {
        const { results } = await fetchGenList(gen.offset, gen.count);
        if (ctrl.signal.aborted) return;
        setGs(prev => ({ ...prev, allList: results, initialLoad: false }));

        const BATCH = 15;
        for (let i = 0; i < results.length; i += BATCH) {
          if (ctrl.signal.aborted) return;
          const fetched = await Promise.allSettled(
            results.slice(i, i + BATCH).map((p) => fetchPokemon(p.name))
          );
          if (ctrl.signal.aborted) return;
          setGs(prev => {
            const next = { ...prev.pokemonData };
            fetched.forEach((r) => { if (r.status === "fulfilled") next[r.value.name] = r.value; });
            return {
              ...prev,
              pokemonData: next,
              loadedPct: Math.min(100, Math.round(((i + BATCH) / results.length) * 100)),
            };
          });
        }
      } catch { /* aborted */ }
    })();

    return () => ctrl.abort();
  }, [genId]);

  useEffect(() => { saveFavs(favs); }, [favs]);

  const toggleFav = useCallback((name: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); } else { next.add(name); }
      return next;
    });
  }, []);

  const getStatVal = (d: PokemonData | undefined, statName: string) =>
    d?.stats.find((s) => s.stat.name === statName)?.base_stat ?? 0;

  const filteredSorted = useMemo(() => {
    let list = allList;
    if (favsOnly)     list = list.filter((p) => favs.has(p.name));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.includes(q) || String(getIdFromUrl(p.url)).includes(q));
    }
    if (typeFilter !== "all") {
      list = list.filter((p) => pokemonData[p.name]?.types.some((t) => t.type.name === typeFilter));
    }
    return [...list].sort((a, b) => {
      const da = pokemonData[a.name], db = pokemonData[b.name];
      if (sortBy === "name")  return a.name.localeCompare(b.name);
      if (sortBy === "total") return (db?.stats.reduce((s,x)=>s+x.base_stat,0)??0)-(da?.stats.reduce((s,x)=>s+x.base_stat,0)??0);
      if (sortBy === "hp")    return getStatVal(db,"hp") - getStatVal(da,"hp");
      if (sortBy === "atk")   return getStatVal(db,"attack") - getStatVal(da,"attack");
      if (sortBy === "spe")   return getStatVal(db,"speed") - getStatVal(da,"speed");
      return getIdFromUrl(a.url) - getIdFromUrl(b.url);
    });
  }, [allList, pokemonData, search, typeFilter, sortBy, favsOnly, favs]);

  const displayed = filteredSorted.slice(0, displayCount);
  const hasMore   = filteredSorted.length > displayCount;

  return (
    <>
      <style>{CSS}</style>

      <div className="app">
        {/* ── Header ── */}
        <header className="header">
          <div className="logo">
            <svg className="logo-icon" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="#6390F0" strokeWidth="2"/>
              <path d="M1 16h30M16 1v5M16 26v5" stroke="#6390F0" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="5" fill="#6390F0"/>
              <circle cx="16" cy="16" r="2.5" fill="#060b18"/>
            </svg>
            <span>PokePortal</span>
          </div>

          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 18 18" fill="none">
              <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search name or ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setDisplayCount(PAGE_SIZE); }}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="header-controls">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setDisplayCount(PAGE_SIZE); }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button
              className={`fav-filter-btn${favsOnly ? " fav-filter-btn--active" : ""}`}
              onClick={() => { setFavsOnly(v => !v); setDisplayCount(PAGE_SIZE); }}
              title="Favourites only"
            >♥ {favs.size}</button>

            <div className="header-stat">
              <div className="hstat-nums">
                <span className="hs-loaded">{Object.keys(pokemonData).length}</span>
                <span className="hs-sep"> / </span>
                <span className="hs-total">{allList.length}</span>
              </div>
              {loadedPct < 100 && (
                <div className="load-bar">
                  <div className="load-bar-fill" style={{ width: `${loadedPct}%` }} />
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main">
          {/* ── Generation Bar ── */}
          <div className="gen-bar">
            {GENERATIONS.map((g) => (
              <button
                key={g.id}
                className={`gen-tab${genId === g.id ? " gen-tab--active" : ""}`}
                onClick={() => setGenId(g.id)}
                title={g.region}
              >
                <span className="gen-label">{g.label}</span>
                <span className="gen-region">{g.region}</span>
              </button>
            ))}
          </div>

          {/* ── Type Filter ── */}
          <div className="type-bar">
            <button
              className={`type-pill${typeFilter === "all" ? " type-pill--active" : ""}`}
              onClick={() => { setTypeFilter("all"); setDisplayCount(PAGE_SIZE); }}
            >All</button>
            {ALL_TYPES.map((t) => (
              <button
                key={t}
                className={`type-pill${typeFilter === t ? " type-pill--active" : ""}`}
                style={typeFilter === t ? { background: TYPE_COLORS[t], color: "#000", borderColor: TYPE_COLORS[t] } : {}}
                onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
              >{t}</button>
            ))}
          </div>

          {/* ── Content ── */}
          {initialLoad ? (
            <div className="blank-state">
              <div className="pokeball-spin">
                <div className="pb-top"/><div className="pb-mid"/><div className="pb-btn"/>
              </div>
              <span>Loading Pokédex…</span>
            </div>
          ) : filteredSorted.length === 0 ? (
            <div className="blank-state">
              <span style={{ fontSize: "3rem" }}>
                {favsOnly ? "♥" : "🔍"}
              </span>
              <span>
                {favsOnly
                  ? "No favourites yet — click ♥ on any card!"
                  : "No Pokémon match this filter."}
              </span>
            </div>
          ) : (
            <>
              <div className="grid">
                {displayed.map((entry) => (
                  <PokemonCard
                    key={entry.name}
                    entry={entry}
                    data={pokemonData[entry.name]}
                    onClick={setModalName}
                    isFav={favs.has(entry.name)}
                    onFavToggle={toggleFav}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="loadmore-wrap">
                  <button
                    className="loadmore-btn"
                    onClick={() => setDisplayCount(c => c + PAGE_SIZE)}
                  >
                    Load more · {filteredSorted.length - displayCount} remaining
                  </button>
                </div>
              )}
              <p className="results-info">
                Showing {Math.min(displayCount, filteredSorted.length)} of {filteredSorted.length} Pokémon
              </p>
            </>
          )}
        </main>
      </div>

      {modalName && (
        <Modal
          name={modalName}
          onClose={() => setModalName(null)}
          onNavigate={(n) => setModalName(n)}
        />
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#060b18;--bg2:#0c1426;--bg3:#111d30;--bg4:#1a2740;
  --border:rgba(255,255,255,.06);--border2:rgba(255,255,255,.11);
  --text:#e4e9f4;--muted:#5d6f8a;--accent:#6390F0;--radius:14px;
}
html{scroll-behavior:smooth;}
body{background:var(--bg);color:var(--text);font-family:'DM Mono',monospace;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:var(--bg);}
::-webkit-scrollbar-thumb{background:#1e3254;border-radius:3px;}
::-webkit-scrollbar-thumb:hover{background:#2d4a7a;}

/* bg */
.app{min-height:100vh;position:relative;}
.app::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 90% 60% at 15% -5%,rgba(99,144,240,.07) 0%,transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 105%,rgba(115,87,151,.05) 0%,transparent 55%);
}

/* header */
.header{
  position:sticky;top:0;z-index:200;height:60px;
  display:flex;align-items:center;gap:1.25rem;
  padding:0 1.5rem;
  background:rgba(6,11,24,.9);backdrop-filter:blur(24px);
  border-bottom:1px solid var(--border);
}
.logo{display:flex;align-items:center;gap:.5rem;flex-shrink:0;font-family:'Syne',sans-serif;font-weight:800;font-size:1.2rem;color:#fff;letter-spacing:-.02em;}
.logo-icon{width:26px;height:26px;filter:drop-shadow(0 0 8px rgba(99,144,240,.5));}
.search-wrap{flex:1;max-width:380px;position:relative;}
.search-icon{position:absolute;left:.7rem;top:50%;transform:translateY(-50%);color:var(--muted);width:15px;height:15px;pointer-events:none;}
.search-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:.45rem 2rem .45rem 2.1rem;color:var(--text);font-family:'DM Mono',monospace;font-size:.8rem;outline:none;transition:border-color .2s,box-shadow .2s;}
.search-input:focus{border-color:rgba(99,144,240,.35);box-shadow:0 0 0 3px rgba(99,144,240,.07);}
.search-input::placeholder{color:var(--muted);}
.search-clear{position:absolute;right:.55rem;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);cursor:pointer;font-size:.72rem;transition:color .15s;}
.search-clear:hover{color:var(--text);}
.header-controls{display:flex;align-items:center;gap:.6rem;flex-shrink:0;margin-left:auto;}
.sort-select{background:var(--bg3);border:1px solid var(--border2);color:var(--text);font-family:'DM Mono',monospace;font-size:.72rem;padding:.35rem .6rem;border-radius:7px;outline:none;cursor:pointer;}
.fav-filter-btn{background:var(--bg3);border:1px solid var(--border2);color:var(--muted);border-radius:7px;padding:.35rem .65rem;font-family:'DM Mono',monospace;font-size:.72rem;cursor:pointer;transition:all .15s;}
.fav-filter-btn:hover{color:var(--text);}
.fav-filter-btn--active{color:#e25555;border-color:#e2555540;background:#e2555510;}
.header-stat{display:flex;flex-direction:column;align-items:flex-end;gap:.15rem;}
.hstat-nums{font-size:.68rem;}
.hs-loaded{color:var(--accent);}
.hs-sep,.hs-total{color:var(--muted);}
.load-bar{width:54px;height:2px;background:var(--bg4);border-radius:1px;overflow:hidden;}
.load-bar-fill{height:100%;background:var(--accent);border-radius:1px;transition:width .3s ease;}

/* main */
.main{position:relative;z-index:1;max-width:1440px;margin:0 auto;padding:1.5rem 1.5rem 5rem;}

/* gen bar */
.gen-bar{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:1rem;}
.gen-tab{display:flex;flex-direction:column;align-items:center;background:var(--bg3);border:1px solid var(--border);border-radius:9px;padding:.3rem .65rem;cursor:pointer;transition:all .15s;min-width:60px;}
.gen-tab:hover{border-color:var(--border2);background:var(--bg4);}
.gen-tab--active{background:var(--bg4);border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);}
.gen-label{font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;color:var(--text);}
.gen-region{font-size:.58rem;color:var(--muted);letter-spacing:.04em;}

/* type bar */
.type-bar{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:1.5rem;}
.type-pill{padding:.22rem .6rem;border-radius:999px;font-family:'DM Mono',monospace;font-size:.63rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;cursor:pointer;transition:all .15s;background:var(--bg3);color:var(--muted);border:1px solid var(--border);}
.type-pill:hover{color:var(--text);border-color:var(--border2);}
.type-pill--active{font-weight:700;}

/* grid */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.85rem;}

/* card */
.card{position:relative;overflow:hidden;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1rem .85rem .85rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:.5rem;text-align:center;transition:transform .2s ease,box-shadow .25s ease,border-color .2s;}
.card-shine{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 100% 80% at 50% -10%,var(--card-accent),transparent 60%);opacity:0;transition:opacity .25s;}
.card:hover{transform:translateY(-5px);border-color:rgba(255,255,255,.1);box-shadow:0 18px 50px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05);}
.card:hover .card-shine{opacity:.12;}
.card:active{transform:translateY(-2px);}
.fav-btn{position:absolute;top:.5rem;right:.5rem;background:none;border:none;cursor:pointer;font-size:.9rem;color:var(--muted);transition:color .15s,transform .15s;padding:.2rem;line-height:1;}
.fav-btn:hover{transform:scale(1.25);}
.fav-btn--active{color:#e25555;}
.card-id{font-size:.62rem;color:var(--muted);align-self:flex-start;letter-spacing:.05em;}
.card-sprite{width:88px;height:88px;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4));transition:transform .3s ease;image-rendering:auto;}
.card:hover .card-sprite{transform:scale(1.12) translateY(-4px);}
.card-ghost{width:88px;height:88px;background:var(--bg3);border-radius:50%;animation:pulse 1.6s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:.35}50%{opacity:.6}}
.card-name{font-family:'Syne',sans-serif;font-weight:700;font-size:.84rem;color:#fff;text-transform:capitalize;letter-spacing:.01em;}
.card-types{display:flex;gap:.3rem;flex-wrap:wrap;justify-content:center;}
.type-badge{border-radius:999px;font-weight:700;text-transform:uppercase;color:rgba(0,0,0,.72);}
.type-badge--sm{padding:.15rem .5rem;font-size:.58rem;letter-spacing:.07em;}
.type-badge--md{padding:.25rem .65rem;font-size:.65rem;letter-spacing:.07em;}
.type-badge-ghost{width:48px;height:17px;background:var(--bg3);border-radius:999px;animation:pulse 1.6s ease-in-out infinite;}

/* load more */
.loadmore-wrap{display:flex;justify-content:center;margin-top:2.5rem;}
.loadmore-btn{background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:8px;padding:.6rem 1.5rem;font-family:'DM Mono',monospace;font-size:.78rem;cursor:pointer;letter-spacing:.04em;transition:all .2s;}
.loadmore-btn:hover{background:var(--bg4);border-color:var(--accent);color:var(--accent);}
.results-info{text-align:center;margin-top:1rem;font-size:.68rem;color:var(--muted);letter-spacing:.04em;}

/* blank */
.blank-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.25rem;padding:6rem 2rem;color:var(--muted);font-size:.82rem;text-align:center;}

/* pokeball */
.pokeball-spin{width:48px;height:48px;border-radius:50%;overflow:hidden;position:relative;border:3px solid var(--border2);animation:spin 1s linear infinite;flex-shrink:0;}
.pb-top{position:absolute;top:0;left:0;right:0;height:50%;background:#e63946;}
.pb-mid{position:absolute;top:50%;left:0;right:0;height:3px;background:#fff;transform:translateY(-50%);z-index:1;}
.pb-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid #333;z-index:2;}
@keyframes spin{to{transform:rotate(360deg);}}

/* overlay / modal */
.overlay{position:fixed;inset:0;z-index:1000;background:rgba(6,11,24,.85);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn .2s ease;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:var(--bg2);border:1px solid var(--border2);border-radius:20px;width:100%;max-width:720px;max-height:92vh;overflow-y:auto;position:relative;box-shadow:0 48px 120px rgba(0,0,0,.7);animation:slideUp .28s cubic-bezier(.34,1.56,.64,1);}
@keyframes slideUp{from{opacity:0;transform:translateY(22px) scale(.96)}to{opacity:1;transform:none}}
.modal-close{position:absolute;top:1rem;right:1rem;z-index:10;background:var(--bg3);border:1px solid var(--border2);color:var(--muted);width:28px;height:28px;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.75rem;transition:all .15s;}
.modal-close:hover{color:#fff;border-color:rgba(255,255,255,.2);}
.modal-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.25rem;height:320px;color:var(--muted);font-size:.82rem;}

/* hero */
.modal-hero{display:flex;gap:1.75rem;align-items:flex-start;padding:2rem 2rem 0;border-radius:20px 20px 0 0;}
.modal-sprite-wrap{flex-shrink:0;width:175px;display:flex;flex-direction:column;align-items:center;gap:.65rem;position:relative;}
.sprite-glow{position:absolute;top:10px;left:10px;right:10px;bottom:35px;border-radius:50%;opacity:.25;filter:blur(28px);}
.modal-sprite{width:155px;height:155px;object-fit:contain;position:relative;z-index:1;filter:drop-shadow(0 10px 22px rgba(0,0,0,.5));animation:float 3.5s ease-in-out infinite;image-rendering:auto;}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.sprite-controls{display:flex;gap:.4rem;flex-wrap:wrap;justify-content:center;position:relative;z-index:1;}
.ctrl-btn{background:var(--bg3);border:1px solid var(--border2);color:var(--muted);border-radius:6px;padding:.25rem .55rem;font-family:'DM Mono',monospace;font-size:.65rem;cursor:pointer;transition:all .15s;}
.ctrl-btn:hover{color:var(--text);border-color:var(--border2);}
.ctrl-btn--active{color:#f7d02c;border-color:#f7d02c50;background:#f7d02c10;}

/* meta */
.modal-meta{flex:1;padding-top:.5rem;}
.modal-num{font-size:.68rem;color:var(--muted);letter-spacing:.1em;margin-bottom:.2rem;}
.modal-name{font-family:'Syne',sans-serif;font-weight:800;font-size:1.9rem;color:#fff;text-transform:capitalize;line-height:1;letter-spacing:-.02em;margin-bottom:.2rem;}
.modal-genus{font-size:.7rem;color:var(--muted);margin-bottom:.55rem;font-style:italic;}
.modal-types{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.85rem;}
.phys-grid{display:grid;grid-template-columns:repeat(4,auto);gap:.6rem 1.25rem;margin-bottom:.75rem;}
.phys-cell{display:flex;flex-direction:column;gap:.08rem;}
.phys-label{font-size:.58rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);}
.phys-val{font-size:.82rem;color:var(--text);font-weight:500;text-transform:capitalize;}
.badges-row{display:flex;gap:.4rem;flex-wrap:wrap;}
.lore-badge{border-radius:999px;padding:.18rem .6rem;font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;}
.lore-badge--baby{background:#fce4ec;color:#880e4f;}
.lore-badge--legend{background:#fff8e1;color:#e65100;}
.lore-badge--myth{background:#f3e5f5;color:#4a148c;}

/* tabs */
.tabs{display:flex;margin:1.4rem 2rem 0;border-bottom:1px solid var(--border);}
.tab{background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);cursor:pointer;font-family:'DM Mono',monospace;font-size:.72rem;text-transform:uppercase;letter-spacing:.09em;padding:.55rem 1rem .5rem;transition:color .15s,border-color .15s;margin-bottom:-1px;}
.tab:hover{color:var(--text);}
.tab--active{font-weight:600;}

/* modal body */
.modal-body{padding:1.4rem 2rem 2rem;}
.flavor{font-size:.78rem;color:#8a9abb;line-height:1.75;font-style:italic;margin-bottom:1.2rem;padding:.7rem .9rem;background:var(--bg3);border-left:3px solid var(--accent);border-radius:0 8px 8px 0;}
.section-hd{font-size:.6rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:.75rem;display:flex;align-items:center;gap:.6rem;}
.section-hd::after{content:'';flex:1;height:1px;background:var(--border);}

/* stats */
.stat-row{display:flex;align-items:center;gap:.6rem;margin-bottom:.45rem;}
.stat-abbr{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);width:28px;flex-shrink:0;}
.stat-val{font-size:.76rem;color:var(--text);font-weight:500;width:25px;text-align:right;flex-shrink:0;}
.stat-track{flex:1;height:5px;background:var(--bg3);border-radius:999px;overflow:hidden;}
.stat-fill{height:100%;border-radius:999px;transition:width .7s cubic-bezier(.4,0,.2,1);}

/* abilities */
.abilities{display:flex;flex-wrap:wrap;gap:.45rem;}
.ability{display:flex;align-items:center;gap:.4rem;background:var(--bg3);border:1px solid var(--border2);border-radius:8px;padding:.3rem .7rem;}
.ability--hidden{border-style:dashed;}
.ability-name{font-size:.74rem;text-transform:capitalize;color:var(--text);}
.ability-tag{font-size:.58rem;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);background:var(--bg4);border-radius:4px;padding:.1rem .3rem;}

/* move tabs */
.move-tabs{display:flex;margin-bottom:.85rem;border-bottom:1px solid var(--border);}
.move-tab{background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);cursor:pointer;font-family:'DM Mono',monospace;font-size:.68rem;text-transform:uppercase;letter-spacing:.09em;padding:.45rem .85rem .4rem;transition:color .15s,border-color .15s;margin-bottom:-1px;}
.move-tab:hover{color:var(--text);}
.move-tab--active{font-weight:600;}

/* moves */
.moves-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:.35rem;max-height:300px;overflow-y:auto;}
.move-item{display:flex;align-items:center;gap:.45rem;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:.28rem .55rem;}
.move-lv{font-size:.58rem;color:var(--accent);min-width:28px;flex-shrink:0;}
.move-name{font-size:.7rem;color:var(--text);text-transform:capitalize;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.no-data{font-size:.78rem;color:var(--muted);font-style:italic;padding:.5rem 0;}

/* type chart */
.type-chart{display:flex;flex-direction:column;gap:.65rem;}
.tc-row{display:flex;align-items:center;gap:.75rem;}
.tc-label{font-family:'Syne',sans-serif;font-weight:700;font-size:.9rem;width:24px;text-align:right;flex-shrink:0;}
.tc-pills{display:flex;flex-wrap:wrap;gap:.35rem;}

/* evolution */
.evo-chain{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;}
.evo-stage{display:flex;align-items:center;gap:.4rem;}
.evo-arrow{display:flex;flex-direction:column;align-items:center;gap:.15rem;color:var(--muted);}
.evo-trigger{font-size:.58rem;color:var(--muted);text-align:center;text-transform:capitalize;max-width:64px;word-break:break-word;}
.evo-nodes{display:flex;flex-direction:column;gap:.4rem;}
.evo-node{display:flex;flex-direction:column;align-items:center;gap:.3rem;padding:.55rem .45rem;border-radius:10px;border:1px solid transparent;cursor:pointer;transition:all .15s;min-width:80px;}
.evo-node:hover{background:var(--bg3);border-color:var(--border2);}
.evo-node--active{background:var(--bg3);border-color:var(--accent);cursor:default;}
.evo-img{width:60px;height:60px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));image-rendering:auto;}
.evo-ghost{width:60px;height:60px;background:var(--bg3);border-radius:50%;animation:pulse 1.6s ease-in-out infinite;}
.evo-label{font-size:.64rem;color:var(--text);text-transform:capitalize;text-align:center;}

/* responsive */
@media(max-width:700px){
  .header{padding:0 1rem;gap:.75rem;}
  .header-stat{display:none;}
  .main{padding:1.25rem 1rem 4rem;}
  .modal-hero{flex-direction:column;align-items:center;text-align:center;padding:1.5rem 1.5rem 0;}
  .modal-meta{display:flex;flex-direction:column;align-items:center;}
  .phys-grid{grid-template-columns:repeat(2,auto);}
  .modal-body,.tabs{padding-left:1.5rem;padding-right:1.5rem;}
  .tabs{margin-left:1.5rem;margin-right:1.5rem;}
  .modal-name{font-size:1.55rem;}
  .grid{grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:.7rem;}
}
@media(max-width:420px){
  .grid{grid-template-columns:repeat(2,1fr);}
  .gen-bar{gap:.2rem;}
}
`;
