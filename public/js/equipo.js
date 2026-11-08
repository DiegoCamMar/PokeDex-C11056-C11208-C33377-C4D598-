const CLAVE = 'pokedex:equipo';

// Lee del localStorage y devuelve un Set de ids (sin repetidos).
function leer() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAVE)) ?? []);
  } catch {
    return new Set();   // si algo falla (modo privado, etc.), arrancamos vacío
  }
}

// Guarda el Set en localStorage (como texto JSON).
function escribir(conjunto) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...conjunto]));
  } catch { /* si no se puede guardar, seguimos sin romper */ }
}

export function estaEnEquipo(id) {
  return leer().has(id);
}

// Agrega varios ids a equipo (los que ya estaban no se repiten).
// Devuelve la lista completa del equipo al finalizar.
export function agregarEquipo(ids) {
  const equipo = leer();
  ids.forEach((id) => {
    if (equipo.size < 6) {
      equipo.add(id)
    }
  });

  escribir(equipo);
  return [...equipo];
}

// Quita un id de equipo. Devuelve la lista completa que queda.
// Usar en el diálogo de Equipo que tiene un botón de "Quitar" para cada Pokémon.
export function quitarEquipo(id) {
  const equipo = leer();
  equipo.delete(id);
  escribir(equipo);
  return [...equipo];
}

// Quita varios ids de equipo. Devuelve la lista completa que queda.
// Usar en el diálogo de Capturados con el botón "Quitar", 
// que elimina todos los pokémon seleccionados.
export function quitarVariosEquipo(ids) {
  const equipo = leer();
  ids.forEach((id) => equipo.delete(id));
  escribir(equipo);
  return [...equipo];
}

export function listaEquipo() {
  return [...leer()];
}