/* El patrón se replicó del repo del curso, asegurándose de que las funciones que manejan el localStorage (leer, 
escribir) sean internos, y las funciones exportadas llamen a ese para no exponer implementación interna. */
const CLAVE = 'pokedex:favoritos';

// Lee del localStorage y devuelve un Set de ids (sin repetidos).
function leer() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAVE)) ?? []);
  } catch {
    return new Set(); // si algo falla, arranca vacío
  }
}

// Guarda el Set en localStorage (como texto JSON).
function escribir(conjunto) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...conjunto]));
  } catch { /* si no se puede guardar, seguimos sin romper */ }
}

export function esFavorito(id) {
  return leer().has(id);
}

// Agrega varios ids a favoritos (los que ya estaban no se repiten).
// Devuelve la lista completa de favoritos al finalizar.
export function agregarFavoritos(ids) {
  const favoritos = leer();
  ids.forEach((id) => favoritos.add(id));
  escribir(favoritos);
  return [...favoritos];
}

// Quita un id de favoritos. Devuelve la lista completa que queda.
// Usar en el diálogo de Favoritos que tiene un botón de "Quitar" para cada Pokémon.
export function quitarFavorito(id) {
  const favoritos = leer();
  favoritos.delete(id);
  escribir(favoritos);
  return [...favoritos];
}

// Quita varios ids de favoritos. Devuelve la lista completa que queda.
// Usar en el diálogo de Capturados con el botón "Quitar Favorito", 
// que elimina todos los pokémon seleccionados.
export function quitarFavoritos(ids) {
  const favoritos = leer();
  ids.forEach((id) => favoritos.delete(id));
  escribir(favoritos);
  return [...favoritos];
}

// Devuelve la lista completa de favoritos, llamando al leer() privado.
export function listaFavoritos() {
  return [...leer()];
}